// POST /api/wallet/disconnect — revoga a conexão NWC do usuário.
// Revogar = APAGAR o segredo (não só marcar flag). É a peça que o
// Modo Emergência vai reutilizar.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  await supabaseAdmin
    .from("nwc_connections")
    .update({ revoked_at: new Date().toISOString(), connection_secret_enc: null })
    .eq("user_id", session.userId)
    .is("revoked_at", null);

  return NextResponse.json({ ok: true });
}
