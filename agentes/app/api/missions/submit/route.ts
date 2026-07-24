// POST /api/missions/submit — mentoria em chat (slug 1 ou 2).
// Sats só na PRIMEIRA conclusão com respostas (não skip).
// Refazer depois: 0 sats. Quem só pulou ainda pode ganhar na primeira vez de verdade.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { ensureMission } from "@/lib/ensure-mission";
import {
  gradeMentor,
  isMissionSlug,
  MISSION_1_SLUG,
  questionsFor,
  type MentorResponse,
  type MissionSlug,
} from "@/lib/quiz";

function wasRewarded(marker: string | null | undefined): boolean {
  if (!marker) return false;
  if (marker === "internal:skipped") return false;
  // internal:balance | voltage:… | qualquer outro = já passou pela recompensa
  return true;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "faça login" }, { status: 401 });
  }

  let body: { slug?: string; responses?: MentorResponse[]; skipAll?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const rawSlug = body.slug ?? MISSION_1_SLUG;
  if (!isMissionSlug(rawSlug)) {
    return NextResponse.json({ error: "missão inválida" }, { status: 400 });
  }
  const slug: MissionSlug = rawSlug;
  const questions = questionsFor(slug);

  const skipAll = body.skipAll === true;
  let responses: MentorResponse[];

  if (skipAll) {
    responses = questions.map(() => ({ answer: null, skipped: true }));
  } else {
    responses = body.responses ?? [];
    if (!Array.isArray(responses) || responses.length !== questions.length) {
      return NextResponse.json({ error: "respostas incompletas" }, { status: 400 });
    }
  }

  const graded = gradeMentor(slug, responses);

  let mission;
  try {
    mission = await ensureMission(slug);
  } catch {
    return NextResponse.json({ error: "missão não encontrada" }, { status: 500 });
  }

  const { data: existing } = await supabaseAdmin
    .from("user_missions")
    .select("lnurl_withdraw")
    .eq("user_id", session.userId)
    .eq("mission_id", mission.id)
    .maybeSingle();

  const alreadyRewarded = wasRewarded(existing?.lnurl_withdraw);
  // Só credita se nunca foi recompensado E não está pulando tudo agora
  const firstReward = !alreadyRewarded && !skipAll;

  const marker = skipAll
    ? alreadyRewarded
      ? existing!.lnurl_withdraw // não rebaixa quem já ganhou
      : "internal:skipped"
    : "internal:balance";

  if (!existing) {
    await supabaseAdmin.from("user_missions").insert({
      user_id: session.userId,
      mission_id: mission.id,
      withdrawn_at: new Date().toISOString(),
      lnurl_withdraw: marker,
    });
  } else if (!alreadyRewarded) {
    // pulou antes → agora concluiu (ou pulou de novo)
    await supabaseAdmin
      .from("user_missions")
      .update({
        completed_at: new Date().toISOString(),
        withdrawn_at: new Date().toISOString(),
        lnurl_withdraw: marker,
      })
      .eq("user_id", session.userId)
      .eq("mission_id", mission.id);
  }
  // se alreadyRewarded: só prática — não mexe no registro de recompensa

  let satsBalance = 0;
  let satsCredited = 0;
  let xpGained = 0;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("xp, sats_balance")
    .eq("id", session.userId)
    .single();

  satsBalance = user?.sats_balance ?? 0;

  if (firstReward) {
    satsCredited = graded.satsEarned;
    xpGained = graded.correctCount * 2;
    satsBalance = satsBalance + satsCredited;

    await supabaseAdmin
      .from("users")
      .update({
        xp: (user?.xp ?? 0) + xpGained,
        sats_balance: satsBalance,
      })
      .eq("id", session.userId);
  }

  return NextResponse.json({
    slug,
    firstCompletion: firstReward,
    alreadyRewarded,
    practiceOnly: alreadyRewarded,
    skipAll,
    satsCredited,
    xpGained,
    satsBalance,
    ...graded,
    total: questions.length,
  });
}
