// lib/heranca-notificacao.ts
// Lembretes ao titular + notificação aos herdeiros (e-mail obrigatório; Nostr opcional).
// Falha de e-mail/DM nunca trava o processo.

import { finalizeEvent, getPublicKey, nip04, nip19 } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";
import { enviarEmailResend } from "@/lib/email";
import { appBaseUrl } from "@/lib/heranca";
import { supabaseAdmin } from "@/lib/supabase";

export type PlanNotif = {
  id: string;
  checkin_token?: string | null;
  titular_email?: string | null;
  user_id: string;
};

export type HeirNotif = {
  id: string;
  name: string;
  email?: string | null;
  telefone?: string | null;
  npub?: string | null;
  notified_at?: string | null;
};

function serviceSk(): Uint8Array | null {
  const nsec = process.env.SATVANTAGE_SERVICE_NSEC?.trim();
  if (!nsec) return null;
  try {
    const decoded = nip19.decode(nsec);
    if (decoded.type !== "nsec") return null;
    return decoded.data as Uint8Array;
  } catch {
    return null;
  }
}

export async function enviarLembreteTitular(
  plan: PlanNotif,
  estagio: 1 | 2,
): Promise<void> {
  const email = plan.titular_email?.trim();
  if (!email || !plan.checkin_token) return;

  const link = `${appBaseUrl()}/api/heranca/checkin-link/${plan.checkin_token}`;
  const subject =
    estagio === 1
      ? "SatVantage — confirmação rápida de prova de vida"
      : "SatVantage — último aviso antes de notificar herdeiros";

  const intro =
    estagio === 1
      ? "Faz um tempo que você não confirma sua conta — tudo bem? Um clique basta para renovar sua prova de vida."
      : "Se não confirmarmos em breve, seus herdeiros cadastrados serão notificados. Confirme agora se estiver tudo bem.";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 12px">Prova de vida — SatVantage</h2>
      <p style="line-height:1.5">${intro}</p>
      <p style="margin:24px 0">
        <a href="${link}"
           style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
                  padding:12px 18px;border-radius:10px;font-weight:700">
          Confirmar que estou bem
        </a>
      </p>
      <p style="font-size:13px;color:#64748b;line-height:1.4">
        Este link não exige login. Se você não pediu este e-mail, ignore-o.
      </p>
    </div>
  `;

  await enviarEmailResend({ to: email, subject, html });
}

async function enviarDmNostr(heirNpub: string, texto: string): Promise<void> {
  const sk = serviceSk();
  if (!sk) {
    console.warn("[heranca] SATVANTAGE_SERVICE_NSEC ausente — DM Nostr omitida");
    return;
  }
  try {
    const decoded = nip19.decode(heirNpub.trim());
    if (decoded.type !== "npub") return;
    const theirPk = decoded.data as string;
    const ciphertext = await nip04.encrypt(sk, theirPk, texto);
    const event = finalizeEvent(
      {
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", theirPk]],
        content: ciphertext,
      },
      sk,
    );
    // pubkey só para log seguro (nunca a nsec)
    void getPublicKey(sk);

    const pool = new SimplePool();
    const relays = (
      process.env.NOSTR_RELAYS?.split(",").map((s) => s.trim()).filter(Boolean) || [
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.nostr.band",
      ]
    ).slice(0, 4);

    const pubs = pool.publish(relays, event);
    await Promise.any(
      (Array.isArray(pubs) ? pubs : [pubs]).map((p: Promise<unknown>) =>
        Promise.resolve(p).catch((e) => {
          throw e;
        }),
      ),
    ).catch(() => {
      /* best-effort */
    });
    pool.close(relays);
  } catch (e: any) {
    console.error("[heranca] DM Nostr falhou:", e?.message || e);
  }
}

export async function notificarHerdeiros(
  plan: PlanNotif & { triggered_at?: string | null },
  heirs: HeirNotif[],
  titularNpub: string,
): Promise<void> {
  const verifyUrl = `${appBaseUrl()}/heranca/verificar/${plan.id}`;

  for (const heir of heirs) {
    if (heir.notified_at) continue;

    const email = heir.email?.trim();
    if (email) {
      const html = `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#111;line-height:1.55">
          <h1 style="font-size:1.35rem;margin:0 0 16px">Comunicado de Sucessão Digital</h1>
          <p>Prezado(a) <strong>${escapeHtml(heir.name)}</strong>,</p>
          <p>
            Registramos a ativação do plano de sucessão digital vinculado à identidade Nostr
            do titular (<code style="font-size:12px">${escapeHtml(titularNpub)}</code>),
            após período de inatividade com múltiplos avisos prévios sem resposta.
          </p>
          <p>
            O SatVantage <strong>não custodia chaves nem move bitcoins</strong>. Este comunicado
            e o documento abaixo servem como prova verificável (hash ancorado na blockchain
            do Bitcoin) para apresentar a família, advogado ou corretoras.
          </p>
          <p style="margin:24px 0">
            <a href="${verifyUrl}"
               style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;
                      padding:12px 18px;border-radius:8px;font-weight:600;font-family:system-ui,sans-serif">
              Abrir documento de verificação
            </a>
          </p>
          <p style="font-size:13px;color:#555">SatVantage — sucessão digital</p>
        </div>
      `;
      await enviarEmailResend({
        to: email,
        subject: "Comunicado de Sucessão Digital — SatVantage",
        html,
      });
    }

    if (heir.npub?.trim()) {
      const texto =
        `Comunicado de Sucessão Digital — SatVantage\n` +
        `Titular (npub): ${titularNpub}\n` +
        `Documento: ${verifyUrl}\n` +
        `O SatVantage não custodia chaves nem move fundos.`;
      await enviarDmNostr(heir.npub.trim(), texto);
    }

    await supabaseAdmin
      .from("heirs")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", heir.id);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
