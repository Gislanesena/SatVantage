// POST /api/wallet/test — retesta a credencial NWC já salva (sem colar de novo).
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { decryptSecret } from "@/lib/crypto";
import { testConnection } from "@/lib/nwc";

export async function POST() {
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
    return NextResponse.json(
      { ok: false, error: "nenhuma carteira salva — cole a credencial NWC" },
      { status: 400 },
    );
  }

  const test = await testConnection(decryptSecret(conn.connection_secret_enc));
  if (!test.ok) {
    return NextResponse.json({
      ok: false,
      connected: true,
      label: conn.label,
      error: test.error ?? "carteira não respondeu",
    });
  }

  return NextResponse.json({
    ok: true,
    connected: true,
    reachable: true,
    label: conn.label,
    balanceSats: test.balanceSats,
  });
}
