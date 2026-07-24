// POST /api/rewards/claim — saque do SALDO INTERNO (voucher da mentoria).
// Invoice MutinyNet (lntbs…) com valor EXATO do sats_balance → Tesouraria paga.
import { NextRequest, NextResponse } from "next/server";
import { decode } from "light-bolt11-decoder";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { payInvoiceFromTreasury } from "@/lib/voltage";
import { MISSION_1_SLUG } from "@/lib/quiz";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "faça login" }, { status: 401 });
  }

  let body: { bolt11?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const bolt11 = body.bolt11?.trim();
  if (!bolt11) {
    return NextResponse.json({ error: "cole a cobrança (invoice) da sua carteira" }, { status: 400 });
  }

  if (!bolt11.toLowerCase().startsWith("lntbs")) {
    return NextResponse.json(
      { error: "essa cobrança não é da rede de teste (MutinyNet) — gere na sua carteira MutinyNet" },
      { status: 400 }
    );
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("sats_balance")
    .eq("id", session.userId)
    .single();

  const balance = user?.sats_balance ?? 0;
  if (balance <= 0) {
    return NextResponse.json({ error: "você não tem sats para sacar" }, { status: 409 });
  }

  let invoiceMsats: number;
  try {
    const decoded = decode(bolt11);
    const amountSection = decoded.sections.find((s: any) => s.name === "amount");
    invoiceMsats = Number(amountSection?.value ?? 0);
  } catch {
    return NextResponse.json({ error: "cobrança inválida — copie o texto completo (ln...)" }, { status: 400 });
  }

  const expectedMsats = balance * 1000;
  if (invoiceMsats !== expectedMsats) {
    return NextResponse.json(
      { error: `a cobrança deve ser de exatamente ${balance} sats (seu saldo atual)` },
      { status: 400 }
    );
  }

  // Zera o saldo antes de pagar (anti-duplo-saque)
  const { data: locked } = await supabaseAdmin
    .from("users")
    .update({ sats_balance: 0 })
    .eq("id", session.userId)
    .eq("sats_balance", balance)
    .select("id")
    .maybeSingle();

  if (!locked) {
    return NextResponse.json({ error: "saldo mudou — atualize e tente de novo" }, { status: 409 });
  }

  const result = await payInvoiceFromTreasury(bolt11, expectedMsats);

  if (!result.ok) {
    await supabaseAdmin
      .from("users")
      .update({ sats_balance: balance })
      .eq("id", session.userId);
    return NextResponse.json({ error: result.error ?? "pagamento falhou" }, { status: 502 });
  }

  const { data: mission } = await supabaseAdmin
    .from("missions")
    .select("id")
    .eq("slug", MISSION_1_SLUG)
    .maybeSingle();

  if (mission) {
    await supabaseAdmin
      .from("user_missions")
      .update({ lnurl_withdraw: `voltage:${result.paymentId}` })
      .eq("user_id", session.userId)
      .eq("mission_id", mission.id);
  }

  return NextResponse.json({
    ok: true,
    paymentId: result.paymentId,
    satsPaid: balance,
    satsBalance: 0,
  });
}
