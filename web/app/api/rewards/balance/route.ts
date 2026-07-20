// GET /api/rewards/balance — saldo interno (voucher da mentoria) + referência de garantia.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("sats_balance, xp")
    .eq("id", session.userId)
    .single();

  const satsBalance = user?.sats_balance ?? 0;
  const npub = session.npub || "";
  const npubShort =
    npub.length > 16 ? `${npub.slice(0, 10)}…${npub.slice(-6)}` : npub || session.userId.slice(0, 8);

  // Referência legível: amarra o crédito à conta Nostr (não é chave privada).
  const claimRef =
    satsBalance > 0
      ? `SV-${session.userId.replace(/-/g, "").slice(0, 8).toUpperCase()}-${satsBalance}`
      : null;

  return NextResponse.json({
    satsBalance,
    xp: user?.xp ?? 0,
    npubShort,
    claimRef,
  });
}
