// POST /api/rewards/credit-quiz
// Credita sats ganhos no quiz livre da NagAI (mentor Python) no saldo interno.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

const MAX_QUIZ_SATS = 5;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "faça login" }, { status: 401 });
  }

  let body: { amount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount < 1 || amount > MAX_QUIZ_SATS) {
    return NextResponse.json(
      { error: `amount inválido (use 1–${MAX_QUIZ_SATS})` },
      { status: 400 },
    );
  }

  const { data: user, error: readError } = await supabaseAdmin
    .from("users")
    .select("sats_balance")
    .eq("id", session.userId)
    .single();

  if (readError || !user) {
    return NextResponse.json({ error: "usuário não encontrado" }, { status: 404 });
  }

  const nextBalance = (user.sats_balance ?? 0) + amount;

  const { data: updated, error: creditError } = await supabaseAdmin
    .from("users")
    .update({ sats_balance: nextBalance })
    .eq("id", session.userId)
    .select("sats_balance")
    .single();

  if (creditError || updated?.sats_balance == null) {
    console.error("[rewards/credit-quiz] falha ao creditar", {
      userId: session.userId,
      amount,
      error: creditError,
    });
    return NextResponse.json(
      { error: "não foi possível creditar os sats — tente de novo" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    satsCredited: amount,
    satsBalance: updated.sats_balance,
  });
}
