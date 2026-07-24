// POST /api/missions/check — feedback de UMA pergunta (sem creditar sats).
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  isMissionSlug,
  MISSION_1_SLUG,
  questionsFor,
  SATS_CORRECT,
  SATS_TRIED,
  type MissionSlug,
} from "@/lib/quiz";

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

  return NextResponse.json({
    correct,
    feedback: correct ? q.feedbackCorrect : q.feedbackWrong,
    sats: correct ? SATS_CORRECT : SATS_TRIED,
  });
}
