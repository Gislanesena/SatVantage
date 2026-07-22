// lib/heranca.ts
//
// O SatVantage NÃO custodia chaves nem move bitcoins na herança.
// FASE 1 — Prova documental: documento determinístico → SHA-256 → OpenTimestamps
//   (carimbo na blockchain do Bitcoin; confirmação pode levar horas).
// FASE 2 — Prova de vida: check-ins + lembretes escalonados antes de ativar.

import { createHash } from "crypto";

// Pacote CJS legado — só no servidor.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const OpenTimestamps = require("opentimestamps") as any;

export type HeirDoc = {
  name: string;
  percent: number;
  email?: string | null;
  telefone?: string | null;
  npub?: string | null;
};

export type PlanDocInput = {
  planId: string;
  titularNpub: string;
  createdAt: string; // ISO
  heirs: HeirDoc[];
};

/** Texto/JSON determinístico do plano — mesma entrada → mesmo texto. */
export function gerarDocumentoPlano(plan: PlanDocInput): string {
  const heirs = [...plan.heirs]
    .map((h) => ({
      name: String(h.name || "").trim(),
      percent: Number(h.percent),
      email: h.email ? String(h.email).trim().toLowerCase() : null,
      telefone: h.telefone ? String(h.telefone).trim() : null,
      npub: h.npub ? String(h.npub).trim() : null,
    }))
    .sort((a, b) => {
      const byName = a.name.localeCompare(b.name, "pt");
      if (byName !== 0) return byName;
      return (a.npub || "").localeCompare(b.npub || "");
    });

  const doc = {
    versao: 1,
    tipo: "satvantage-plano-sucesso",
    planId: plan.planId,
    titularNpub: plan.titularNpub,
    createdAt: plan.createdAt,
    herdeiros: heirs,
  };

  return JSON.stringify(doc);
}

export function hashDocumento(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

/** Gera recibo .ots (base64) ancorando o hash nos calendários OpenTimestamps. */
export async function carimbarHash(hashHex: string): Promise<string> {
  const hash = Buffer.from(hashHex, "hex");
  if (hash.length !== 32) throw new Error("hash SHA-256 inválido");

  const detached = OpenTimestamps.DetachedTimestampFile.fromHash(
    new OpenTimestamps.Ops.OpSHA256(),
    hash,
  );
  await OpenTimestamps.stamp(detached);
  const bytes: Buffer = Buffer.from(detached.serializeToBytes());
  return bytes.toString("base64");
}

export type VerificacaoCarimbo = {
  status: "pendente" | "confirmado" | "erro";
  mensagem: string;
  /** unix seconds, se confirmado */
  timestampUnix?: number;
};

/** Verifica o carimbo. "Pendente" é estado válido (pode levar horas). */
export async function verificarCarimbo(
  hashHex: string,
  otsBase64: string,
): Promise<VerificacaoCarimbo> {
  try {
    const hash = Buffer.from(hashHex, "hex");
    const otsBytes = Buffer.from(otsBase64, "base64");
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(
      new OpenTimestamps.Ops.OpSHA256(),
      hash,
    );
    const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(otsBytes);

    // Tenta upgrade (completar prova com calendários) — falha silenciosa se ainda cedo
    try {
      await OpenTimestamps.upgrade(detachedOts);
    } catch {
      /* pendente ok */
    }

    const results = await OpenTimestamps.verify(detachedOts, detached);
    if (!results || Object.keys(results).length === 0) {
      return {
        status: "pendente",
        mensagem:
          "Carimbo ainda pendente na blockchain — isso é normal e pode levar algumas horas.",
      };
    }

    const firstKey = Object.keys(results)[0]!;
    const raw = results[firstKey];
    const unix =
      typeof raw === "number"
        ? raw
        : typeof raw?.timestamp === "number"
          ? raw.timestamp
          : undefined;

    return {
      status: "confirmado",
      mensagem: "Carimbo confirmado na blockchain do Bitcoin.",
      timestampUnix: unix,
    };
  } catch (e: any) {
    const msg = String(e?.message || e || "");
    if (/pending|incomplete|not complete|calendar/i.test(msg)) {
      return {
        status: "pendente",
        mensagem:
          "Carimbo ainda pendente na blockchain — isso é normal e pode levar algumas horas.",
      };
    }
    return {
      status: "erro",
      mensagem: msg || "Não foi possível verificar o carimbo agora.",
    };
  }
}

export function diasDesde(iso: string | null | undefined, now = Date.now()): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, (now - t) / (1000 * 60 * 60 * 24));
}

export function diasRestantesCheckin(
  lastCheckinAt: string | null | undefined,
  intervalDays: number,
  now = Date.now(),
): number {
  const decorridos = diasDesde(lastCheckinAt, now);
  return Math.max(0, Math.ceil(intervalDays - decorridos));
}

/**
 * Tempos de demo/teste da prova de vida:
 * - 30 min sem check-in → e-mail pedindo confirmação
 * - +20 min sem resposta → notifica herdeiros com como acessar
 */
export const HERANCA_LEMBRETE_MINUTES = 30;
export const HERANCA_ATIVAR_EXTRA_MINUTES = 20;
export const HERANCA_INTERVAL_MINUTES =
  HERANCA_LEMBRETE_MINUTES + HERANCA_ATIVAR_EXTRA_MINUTES;

export function minutosDesde(iso: string | null | undefined, now = Date.now()): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, (now - t) / (1000 * 60));
}

export function minutosRestantesCheckin(
  lastCheckinAt: string | null | undefined,
  now = Date.now(),
): number {
  return Math.max(0, Math.ceil(HERANCA_INTERVAL_MINUTES - minutosDesde(lastCheckinAt, now)));
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "http://localhost:3000"
  );
}
