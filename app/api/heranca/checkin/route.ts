// GET/POST /api/heranca/checkin — prova de vida (autenticado)
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { minutosRestantesCheckin } from "@/lib/heranca";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  const { data: plan } = await supabaseAdmin
    .from("inheritance_plans")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ diasRestantes: null, minutosRestantes: null, herdeiros: [] });
  }

  const { data: heirs } = await supabaseAdmin
    .from("heirs")
    .select("id, name, email, telefone, npub, percent, contacts_confirmed_at")
    .eq("plan_id", plan.id);

  const minutosRestantes = minutosRestantesCheckin(plan.last_checkin_at);
  return NextResponse.json({
    minutosRestantes,
    diasRestantes: minutosRestantes,
    lastCheckinAt: plan.last_checkin_at,
    herdeiros: heirs ?? [],
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  let body: { confirmedHeirIds?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { data: plan } = await supabaseAdmin
    .from("inheritance_plans")
    .select("id")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ error: "nenhum plano de herança" }, { status: 400 });
  }

  const now = new Date().toISOString();
  await supabaseAdmin
    .from("inheritance_plans")
    .update({
      last_checkin_at: now,
      reminder_stage: 0,
      updated_at: now,
    })
    .eq("id", plan.id);

  if (Array.isArray(body.confirmedHeirIds) && body.confirmedHeirIds.length) {
    await supabaseAdmin
      .from("heirs")
      .update({ contacts_confirmed_at: now })
      .eq("plan_id", plan.id)
      .in("id", body.confirmedHeirIds);
  }

  return NextResponse.json({ ok: true, lastCheckinAt: now });
}
