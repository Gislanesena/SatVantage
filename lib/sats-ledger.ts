// Extrato de sats — gravação best-effort (não derruba o fluxo se a migração
// ainda não rodou no Supabase).
import { supabaseAdmin } from "@/lib/supabase";

export type LedgerKind = "in" | "out" | "transfer";
export type LedgerSource = "mission" | "voucher" | "wallet";

export type LedgerRow = {
  id: string;
  kind: LedgerKind;
  amount_sats: number;
  source: LedgerSource;
  label: string;
  created_at: string;
  meta?: Record<string, unknown>;
};

export async function recordSatsMovement(input: {
  userId: string;
  kind: LedgerKind;
  amountSats: number;
  source: LedgerSource;
  label: string;
  refKey?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const amount = Math.floor(Number(input.amountSats) || 0);
  if (!input.userId || amount <= 0) return;

  const { error } = await supabaseAdmin.from("sats_ledger").insert({
    user_id: input.userId,
    kind: input.kind,
    amount_sats: amount,
    source: input.source,
    label: String(input.label || "").slice(0, 200),
    ref_key: input.refKey ?? null,
    meta: input.meta ?? {},
  });

  if (error) {
    // 42P01 = tabela inexistente; 23505 = ref duplicada (idempotente — ok)
    const code = (error as { code?: string }).code;
    if (code === "23505") return;
    console.error("[sats_ledger] falha ao gravar (rode supabase/migration_sats_ledger.sql?)", {
      userId: input.userId,
      source: input.source,
      amount,
      error,
    });
  }
}

export async function listSatsMovements(
  userId: string,
  limit = 50,
): Promise<LedgerRow[]> {
  const { data, error } = await supabaseAdmin
    .from("sats_ledger")
    .select("id, kind, amount_sats, source, label, created_at, meta")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(Math.min(100, Math.max(1, limit)));

  if (error) {
    console.error("[sats_ledger] falha ao listar", { userId, error });
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind as LedgerKind,
    amount_sats: row.amount_sats,
    source: row.source as LedgerSource,
    label: row.label || "",
    created_at: row.created_at,
    meta: (row.meta as Record<string, unknown>) ?? {},
  }));
}
