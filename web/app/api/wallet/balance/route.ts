// GET /api/wallet/balance — saldo da carteira conectada.
// Credencial salva = connected. Relay oscilando ≠ “desconectou”.
// Cache curto do último saldo ok pra não martelar o relay e manter a UI estável.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { decryptSecret } from "@/lib/crypto";
import { friendlyNwcError, getBalanceSats } from "@/lib/nwc";

type CacheEntry = {
  balanceSats: number;
  label: string | null;
  at: number;
};

const balanceCache = new Map<string, CacheEntry>();
const FRESH_MS = 40_000; // reusa saldo fresco sem falar com o relay
const STALE_MS = 60 * 60_000; // ainda mostra último saldo por até 1h se o relay falhar

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  const { data: conn } = await supabaseAdmin
    .from("nwc_connections")
    .select("connection_secret_enc, label")
    .eq("user_id", session.userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!conn?.connection_secret_enc) {
    balanceCache.delete(session.userId);
    return NextResponse.json({ connected: false });
  }

  const cached = balanceCache.get(session.userId);
  if (cached && Date.now() - cached.at < FRESH_MS) {
    return NextResponse.json({
      connected: true,
      reachable: true,
      cached: true,
      label: cached.label ?? conn.label,
      balanceSats: cached.balanceSats,
    });
  }

  try {
    const balanceSats = await getBalanceSats(decryptSecret(conn.connection_secret_enc));
    balanceCache.set(session.userId, {
      balanceSats,
      label: conn.label,
      at: Date.now(),
    });
    return NextResponse.json({
      connected: true,
      reachable: true,
      label: conn.label,
      balanceSats,
    });
  } catch (e: any) {
    const err = friendlyNwcError(e);
    if (cached && Date.now() - cached.at < STALE_MS) {
      return NextResponse.json({
        connected: true,
        reachable: false,
        stale: true,
        label: cached.label ?? conn.label,
        balanceSats: cached.balanceSats,
        error: err,
      });
    }
    return NextResponse.json({
      connected: true,
      reachable: false,
      label: conn.label,
      error: err,
    });
  }
}
