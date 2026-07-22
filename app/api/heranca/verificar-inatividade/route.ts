// POST /api/heranca/verificar-inatividade — cron (x-cron-secret)
// Demo: 30 min → lembrete de prova de vida; +20 min sem check → notifica herdeiros.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  HERANCA_ATIVAR_EXTRA_MINUTES,
  HERANCA_INTERVAL_MINUTES,
  HERANCA_LEMBRETE_MINUTES,
  minutosDesde,
} from "@/lib/heranca";
import {
  enviarLembreteTitular,
  notificarHerdeiros,
} from "@/lib/heranca-notificacao";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const header = req.headers.get("x-cron-secret")?.trim();
  if (!secret || header !== secret) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { data: plans, error } = await supabaseAdmin
    .from("inheritance_plans")
    .select("*")
    .eq("status", "carimbado");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let lembrete1 = 0;
  let ativados = 0;

  for (const plan of plans || []) {
    const mins = minutosDesde(plan.last_checkin_at);
    const stage = Number(plan.reminder_stage ?? 0);
    const temEmail = !!plan.titular_email?.trim();
    const now = new Date().toISOString();

    // Com e-mail: 30 min → pede prova de vida; 50 min (30+20) → ativa.
    // Sem e-mail: só ativa no prazo total (check-in manual no app).
    if (temEmail) {
      if (mins >= HERANCA_LEMBRETE_MINUTES && stage === 0) {
        await enviarLembreteTitular(plan, 1);
        await supabaseAdmin
          .from("inheritance_plans")
          .update({
            reminder_stage: 1,
            last_reminder_sent_at: now,
            updated_at: now,
          })
          .eq("id", plan.id);
        lembrete1++;
        continue;
      }
      if (mins >= HERANCA_INTERVAL_MINUTES && stage >= 1) {
        await ativarPlano(plan);
        ativados++;
      }
    } else if (mins >= HERANCA_INTERVAL_MINUTES) {
      await ativarPlano(plan);
      ativados++;
    }
  }

  return NextResponse.json({
    ok: true,
    lembreteAposMin: HERANCA_LEMBRETE_MINUTES,
    ativarAposMin: HERANCA_INTERVAL_MINUTES,
    extraAposLembreteMin: HERANCA_ATIVAR_EXTRA_MINUTES,
    lembrete1,
    ativados,
    analisados: plans?.length ?? 0,
  });
}

async function ativarPlano(plan: any) {
  const now = new Date().toISOString();
  await supabaseAdmin
    .from("inheritance_plans")
    .update({
      status: "ativado",
      triggered_at: now,
      updated_at: now,
    })
    .eq("id", plan.id);

  const { data: heirs } = await supabaseAdmin.from("heirs").select("*").eq("plan_id", plan.id);
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("npub")
    .eq("id", plan.user_id)
    .single();

  await notificarHerdeiros(
    { ...plan, triggered_at: now },
    heirs || [],
    user?.npub || "",
  );
}
