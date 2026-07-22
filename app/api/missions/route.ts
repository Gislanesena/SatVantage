// GET /api/missions?slug=… — lições + status de recompensa
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { ensureMission } from "@/lib/ensure-mission";
import {
  isMissionSlug,
  lessonsForClient,
  MISSION_1_SLUG,
} from "@/lib/quiz";

function wasRewarded(marker: string | null | undefined): boolean {
  if (!marker) return false;
  if (marker === "internal:skipped") return false;
  return true;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "faça login" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("slug") ?? MISSION_1_SLUG;
  if (!isMissionSlug(raw)) {
    return NextResponse.json({ error: "missão inválida" }, { status: 400 });
  }
  const slug = raw;

  let mission;
  try {
    mission = await ensureMission(slug);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "missão não encontrada" },
      { status: 500 },
    );
  }

  const { data: progress } = await supabaseAdmin
    .from("user_missions")
    .select("completed_at, lnurl_withdraw")
    .eq("user_id", session.userId)
    .eq("mission_id", mission.id)
    .maybeSingle();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("xp, sats_balance")
    .eq("id", session.userId)
    .single();

  const rewarded = wasRewarded(progress?.lnurl_withdraw);
  const status = !progress
    ? "disponivel"
    : progress.lnurl_withdraw === "internal:skipped"
      ? "pulada"
      : rewarded
        ? "concluida"
        : "em_andamento"; // já respondeu algo (crédito incremental) mas ainda não terminou

  return NextResponse.json({
    mission: {
      slug: mission.slug,
      title: mission.title,
      description: mission.description,
    },
    status,
    /** true = ainda pode ganhar sats nesta missão */
    rewardEligible: !rewarded,
    /** já concluiu ou pulou alguma vez */
    hasProgress: !!progress,
    xp: user?.xp ?? 0,
    satsBalance: user?.sats_balance ?? 0,
    lessons: lessonsForClient(slug),
  });
}
