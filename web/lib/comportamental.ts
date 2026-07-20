// lib/comportamental.ts — o CORAÇÃO da demo: decide se um envio está fora do
// padrão do usuário e monta a mensagem de fricção reflexiva.
//
// Princípios (decisões de arquitetura, não mudar sem conversar):
// 1. A MATEMÁTICA é sempre daqui (determinística). O agente de IA da dupla
//    só REDIGE o texto — e se ele estiver fora do ar, usamos o fallback local.
// 2. A fricção NUNCA bloqueia: informa, contextualiza e devolve a decisão.
import { supabaseAdmin } from "@/lib/supabase";

export interface FrictionCheck {
  friction: boolean;
  amountSats: number;
  mediaSats: number | null;
  desvioSats: number | null;
  historico: number; // quantos envios anteriores
  message?: string;
}

/** Limiar sem histórico: acima disso, fricção suave mesmo sem padrão. */
const NO_HISTORY_THRESHOLD_SATS = 5000;
/** Fator k do desvio: fora do padrão = acima de média + k·desvio. */
const K = 2;

export async function checkBehavior(userId: string, amountSats: number): Promise<FrictionCheck> {
  // Histórico de envios do usuário (registrados a cada pagamento via SatVantage)
  const { data: rows } = await supabaseAdmin
    .from("aportes")
    .select("amount_sats")
    .eq("user_id", userId)
    .eq("kind", "transferencia")
    .not("amount_sats", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const valores = (rows ?? []).map((r) => Number(r.amount_sats)).filter((v) => v > 0);

  if (valores.length < 3) {
    // Sem padrão estabelecido: fricção suave só para valores altos
    if (amountSats > NO_HISTORY_THRESHOLD_SATS) {
      return {
        friction: true,
        amountSats,
        mediaSats: null,
        desvioSats: null,
        historico: valores.length,
        message:
          `Este é um dos seus primeiros envios pelo SatVantage, e o valor (${amountSats.toLocaleString("pt-BR")} sats) é considerável. ` +
          `Sem pressa: confira o destino com calma e lembre que transações Bitcoin não podem ser desfeitas. ` +
          `Se alguém está te apressando para enviar, isso costuma ser sinal de golpe.`,
      };
    }
    return { friction: false, amountSats, mediaSats: null, desvioSats: null, historico: valores.length };
  }

  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const variancia = valores.reduce((a, b) => a + (b - media) ** 2, 0) / valores.length;
  const desvio = Math.sqrt(variancia);
  const limiar = media + K * desvio;

  if (amountSats <= limiar) {
    return {
      friction: false,
      amountSats,
      mediaSats: Math.round(media),
      desvioSats: Math.round(desvio),
      historico: valores.length,
    };
  }

  // Fora do padrão → tenta o agente da dupla; se falhar, fallback local
  const stats = {
    valor_proposto_sats: amountSats,
    media_historica_sats: Math.round(media),
    desvio_padrao_sats: Math.round(desvio),
    quantidade_envios: valores.length,
  };

  let message = await tryAgentMessage(stats);
  if (!message) {
    const vezes = (amountSats / media).toFixed(1);
    message =
      `Este envio de ${amountSats.toLocaleString("pt-BR")} sats está bem acima do seu padrão — ` +
      `cerca de ${vezes}× a sua média de ${Math.round(media).toLocaleString("pt-BR")} sats. ` +
      `Não há nada de errado em enviar valores maiores; só queremos ter certeza de que é uma decisão sua, pensada. ` +
      `Confira o destinatário com atenção. Se este envio foi motivado por urgência, promessa de retorno ou pedido de terceiros, pare e investigue antes.`;
  }

  return {
    friction: true,
    amountSats,
    mediaSats: Math.round(media),
    desvioSats: Math.round(desvio),
    historico: valores.length,
    message,
  };
}

/** Pede ao agente Comportamental (FastAPI da dupla) para redigir o alerta.
 *  Só dados numéricos e anônimos — NUNCA npub, nome ou identificadores. */
async function tryAgentMessage(stats: Record<string, number>): Promise<string | null> {
  const base = process.env.AGENTS_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/comportamental`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
      signal: AbortSignal.timeout(4000), // demo não pode travar esperando IA
    });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.mensagem === "string" && json.mensagem.length > 0 ? json.mensagem : null;
  } catch {
    return null;
  }
}

/** Registra o envio concluído no histórico (alimenta o padrão futuro). */
export async function recordSend(userId: string, amountSats: number) {
  await supabaseAdmin.from("aportes").insert({
    user_id: userId,
    kind: "transferencia",
    amount_brl: 0.01, // coluna exige > 0; valor em BRL não se aplica a envio Lightning
    amount_sats: amountSats,
    source: "nwc",
  });
}
