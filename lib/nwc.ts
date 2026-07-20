// lib/nwc.ts — o "controle remoto" da carteira do usuário (protocolo NWC).
// SÓ roda no servidor. O segredo NWC vive CIFRADO no banco (crypto.ts) e é
// decifrado apenas na memória, na hora de usar.
//
// A credencial fica salva — o que oscila é o RELAY Nostr (rate-limit / temp-ban).
// Guardamos a versão de criptografia que funcionou pra não martelar o relay.
import WebSocket from "ws";
(globalThis as any).WebSocket ??= WebSocket;

import { nwc } from "@getalby/sdk";
import { createHash } from "crypto";

type NwcVersion = "0.0" | "1.0";

export function normalizeNwcUrl(raw: string): string {
  return raw.trim().replace(/\s+/g, "");
}

function connKey(connectionString: string): string {
  return createHash("sha256").update(normalizeNwcUrl(connectionString)).digest("hex").slice(0, 24);
}

/** Lembra qual criptografia funcionou nesta credencial (evita 2 publishes toda hora). */
const versionByConn = new Map<string, NwcVersion>();

export function rememberNwcVersion(connectionString: string, version: NwcVersion) {
  versionByConn.set(connKey(connectionString), version);
}

function preferredVersions(connectionString: string): NwcVersion[] {
  const remembered = versionByConn.get(connKey(connectionString));
  if (remembered === "0.0") return ["0.0", "1.0"];
  if (remembered === "1.0") return ["1.0", "0.0"];
  // Alby Hub costuma ser 1.0; outras carteiras 0.0
  return ["1.0", "0.0"];
}

function errorText(e: unknown): string {
  const any = e as any;
  return String(any?.error ?? any?.message ?? e ?? "");
}

export function isTempBanned(e: unknown): boolean {
  const msg = errorText(e).toLowerCase();
  return (
    msg.includes("temp-banned") ||
    msg.includes("rate limit") ||
    msg.includes("too many") ||
    (msg.includes("banned") && msg.includes("temp"))
  );
}

function isPublishError(e: unknown): boolean {
  return errorText(e).toLowerCase().includes("failed to publish");
}

function isInfoEventError(e: unknown): boolean {
  const msg = errorText(e);
  return msg.includes("13194") || msg.includes("info event") || msg.includes("compatible version");
}

/** Mensagem amigável (PT) a partir de erro bruto do SDK/relay. */
export function friendlyNwcError(e: unknown): string {
  const raw = errorText(e);
  // Já veio amigável de uma camada anterior
  if (raw.includes("bloqueou temporariamente") || raw.includes("Espere cerca")) return raw;

  if (isTempBanned(e) || raw.toLowerCase().includes("temp-banned")) {
    return "O relay da carteira bloqueou temporariamente este IP (muitas tentativas). Espere cerca de 2 minutos, deixe a carteira aberta e clique em conectar só uma vez.";
  }
  if (isPublishError(e)) {
    return "Não deu para publicar no relay da carteira. Espere um pouco e tente de novo com a carteira online.";
  }
  if (isInfoEventError(e)) {
    return "O relay não devolveu info da carteira. Confira se ela está online e a credencial tem permissão de saldo.";
  }
  if (raw && raw !== "[object Object]") return raw;
  return "não foi possível falar com a carteira";
}

function createClient(connectionString: string, version: NwcVersion) {
  const client = new nwc.NWCClient({
    nostrWalletConnectUrl: normalizeNwcUrl(connectionString),
  });
  client.version = version;
  return client;
}

/**
 * Executa operação NWC. Usa a versão que já funcionou; só tenta a outra se precisar.
 * Para no primeiro temp-banned / falha de publish.
 */
async function withNwcClient<T>(
  connectionString: string,
  fn: (client: InstanceType<typeof nwc.NWCClient>) => Promise<T>,
): Promise<T> {
  const attempts = preferredVersions(connectionString);
  let last: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const version = attempts[i];
    const client = createClient(connectionString, version);
    try {
      const result = await fn(client);
      rememberNwcVersion(connectionString, version);
      return result;
    } catch (e) {
      last = e;
      if (isTempBanned(e) || isPublishError(e)) {
        throw new Error(friendlyNwcError(e));
      }
      if (i < attempts.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
      }
    } finally {
      try {
        client.close();
      } catch {
        /* ignore */
      }
    }
  }

  throw new Error(friendlyNwcError(last));
}

/** Testa uma credencial NWC recém-colada: conecta e pede saldo. */
export async function testConnection(
  connectionString: string,
): Promise<{ ok: boolean; balanceSats?: number; error?: string }> {
  try {
    const normalized = normalizeNwcUrl(connectionString);
    if (!normalized.startsWith("nostr+walletconnect://")) {
      return { ok: false, error: "credencial inválida — deve começar com nostr+walletconnect://" };
    }

    const balanceSats = await withNwcClient(normalized, async (client) => {
      const balance = await client.getBalance();
      return Math.floor(balance.balance / 1000);
    });
    return { ok: true, balanceSats };
  } catch (e: any) {
    return { ok: false, error: friendlyNwcError(e) };
  }
}

/** Lê o saldo (em sats) usando a credencial já decifrada. */
export async function getBalanceSats(connectionString: string): Promise<number> {
  return withNwcClient(connectionString, async (client) => {
    const balance = await client.getBalance();
    return Math.floor(balance.balance / 1000);
  });
}

/** Paga um invoice bolt11 PELA CARTEIRA DO USUÁRIO (não pela Tesouraria!). */
export async function payInvoiceViaNwc(
  connectionString: string,
  bolt11: string,
): Promise<{ ok: boolean; preimage?: string; error?: string }> {
  try {
    const res = await withNwcClient(connectionString, (client) =>
      client.payInvoice({ invoice: bolt11 }),
    );
    return { ok: true, preimage: res.preimage };
  } catch (e: any) {
    return { ok: false, error: friendlyNwcError(e) };
  }
}

/** Gera cobrança Lightning na carteira do usuário (para receber de qualquer lugar). */
export async function makeInvoiceViaNwc(
  connectionString: string,
  amountSats: number,
  description?: string,
): Promise<{ ok: boolean; invoice?: string; error?: string }> {
  try {
    const res = await withNwcClient(connectionString, (client) =>
      client.makeInvoice({
        amount: Math.round(amountSats * 1000), // msats
        description: description || "Recebimento SatVantage",
        expiry: 60 * 60,
      }),
    );
    const invoice = res.invoice;
    if (!invoice) return { ok: false, error: "a carteira não devolveu a cobrança" };
    return { ok: true, invoice };
  } catch (e: any) {
    return { ok: false, error: friendlyNwcError(e) };
  }
}
