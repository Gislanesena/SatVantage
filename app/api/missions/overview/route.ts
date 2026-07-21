// GET /api/missions/overview — status das mentorias 1 e 2 (para o dashboard).
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { ensureMission } from "@/lib/ensure-mission";
import { MISSION_1_SLUG, MISSION_2_SLUG, type MissionSlug } from "@/lib/missions";

function wasRewarded(marker: string | null | undefined): boolean {
  if (!marker) return false;
  if (marker === "internal:skipped") return false;
  return true;
}

async function missionState(userId: string, slug: MissionSlug) {
  const mission = await ensureMission(slug);
  const { data: progress } = await supabaseAdmin
    .from("user_missions")
    .select("lnurl_withdraw")
    .eq("user_id", userId)
    .eq("mission_id", mission.id)
    .maybeSingle();

  const rewarded = wasRewarded(progress?.lnurl_withdraw);
  return {
    slug,
    rewardEligible: !rewarded,
    status: !progress
      ? "disponivel"
      : progress.lnurl_withdraw === "internal:skipped"
        ? "pulada"
        : rewarded
          ? "concluida"
          : "em_andamento",
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  const [m1, m2] = await Promise.all([
    missionState(session.userId, MISSION_1_SLUG),
    missionState(session.userId, MISSION_2_SLUG),
  ]);

  const canEarn = m1.rewardEligible || m2.rewardEligible;
  const startAt = m1.rewardEligible
    ? MISSION_1_SLUG
    : m2.rewardEligible
      ? MISSION_2_SLUG
      : MISSION_1_SLUG;

  return NextResponse.json({
    mentoria1: m1,
    mentoria2: m2,
    canEarn,
    startAt,
  });
}
