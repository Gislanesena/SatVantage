// POST /api/missions/check — feedback de UMA pergunta.
// Credita os sats da pergunta imediatamente (não espera a mentoria terminar),
// assim um refresh no meio da conversa não perde o que já foi respondido.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { ensureMission } from "@/lib/ensure-mission";
import {
  isMissionSlug,
  MISSION_1_SLUG,
  questionsFor,
  SATS_CORRECT,
  SATS_TRIED,
  type MissionSlug,
} from "@/lib/quiz";

function wasRewarded(marker: string | null | undefined): boolean {
  if (!marker) return false;
  if (marker === "internal:skipped") return false;
  return true;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "faça login" }, { status: 401 });
  }

  let body: { slug?: string; lessonIndex?: number; answer?: number };
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

  const i = body.lessonIndex;
  const answer = body.answer;
  if (
    typeof i !== "number" ||
    i < 0 ||
    i >= questions.length ||
    typeof answer !== "number"
  ) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const q = questions[i];
  const correct = answer === q.correct;
  const sats = correct ? SATS_CORRECT : SATS_TRIED;

  let satsBalance: number | undefined;

  try {
    const mission = await ensureMission(slug);

    const { data: existing } = await supabaseAdmin
      .from("user_missions")
      .select("lnurl_withdraw, credited_ids")
      .eq("user_id", session.userId)
      .eq("mission_id", mission.id)
      .maybeSingle();

    const alreadyRewarded = wasRewarded(existing?.lnurl_withdraw);
    const creditedIds: string[] = existing?.credited_ids ?? [];

    if (!existing) {
      await supabaseAdmin.from("user_missions").insert({
        user_id: session.userId,
        mission_id: mission.id,
        credited_ids: [],
      });
    }

    // Prática (mentoria já recompensada antes) nunca credita de novo.
    if (!alreadyRewarded && sats > 0 && !creditedIds.includes(q.id)) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("sats_balance")
        .eq("id", session.userId)
        .single();

      const nextBalance = (user?.sats_balance ?? 0) + sats;

      const { data: updatedUser, error: creditError } = await supabaseAdmin
        .from("users")
        .update({ sats_balance: nextBalance })
        .eq("id", session.userId)
        .select("sats_balance")
        .single();

      if (creditError || updatedUser?.sats_balance == null) {
        console.error("[missions/check] falha ao creditar sats da pergunta", {
          userId: session.userId,
          slug,
          questionId: q.id,
          sats,
          nextBalance,
          error: creditError,
        });
      } else {
        satsBalance = updatedUser.sats_balance;
        // TEMP: log de conferência manual — remover após validar na tabela users.
        console.log("[missions/check] sats creditados", {
          userId: session.userId,
          questionId: q.id,
          sats,
          satsBalance,
        });

        const { error: markError } = await supabaseAdmin
          .from("user_missions")
          .update({ credited_ids: [...creditedIds, q.id] })
          .eq("user_id", session.userId)
          .eq("mission_id", mission.id);

        if (markError) {
          console.error("[missions/check] falha ao marcar pergunta como creditada", {
            userId: session.userId,
            slug,
            questionId: q.id,
            error: markError,
          });
        }
      }
    }
  } catch (e) {
    console.error("[missions/check] erro ao processar crédito da pergunta", e);
  }

  return NextResponse.json({
    correct,
    feedback: correct ? q.feedbackCorrect : q.feedbackWrong,
    sats,
    satsBalance,
  });
}
