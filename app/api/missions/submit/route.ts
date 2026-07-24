// POST /api/missions/submit — fecha a mentoria em chat (slug 1 ou 2).
// Os sats de cada resposta já são creditados incrementalmente em
// /api/missions/check (ver lá o porquê) — DESDE QUE a migração
// supabase/migration_incremental_sats.sql já tenha rodado. Se ainda não rodou,
// caímos no comportamento antigo aqui: credita tudo de uma vez no fechamento
// (evita regressão — melhor que a mentoria completa credite no fim do que
// não creditar nada enquanto a migração não é aplicada).
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
import { recordSatsMovement } from "@/lib/sats-ledger";

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
    const raw = body.responses ?? [];
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json({ error: "respostas incompletas" }, { status: 400 });
    }
    // Cliente pode enviar menos respostas; completa o restante como pulado.
    responses = questions.map((_, i) => {
      const r = raw[i];
      if (!r || typeof r !== "object") return { answer: null, skipped: true };
      return {
        answer: typeof r.answer === "number" ? r.answer : null,
        skipped: !!r.skipped || r.answer === null,
      };
    });
  }

  const graded = gradeMentor(slug, responses);

  let mission;
  try {
    mission = await ensureMission(slug);
  } catch {
    return NextResponse.json({ error: "missão não encontrada" }, { status: 500 });
  }

  // Trava anti-farm — consulta isolada (nunca deve quebrar por causa das
  // colunas novas de progress/sats_credited, ver comentário no topo).
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("user_missions")
    .select("lnurl_withdraw")
    .eq("user_id", session.userId)
    .eq("mission_id", mission.id)
    .maybeSingle();

  if (existingError) {
    console.error("[missions/submit] erro ao ler user_missions", {
      userId: session.userId,
      slug,
      error: existingError,
    });
  }

  const alreadyRewarded = wasRewarded(existing?.lnurl_withdraw);
  // Só credita se nunca foi recompensado E não está pulando tudo agora
  const firstReward = !alreadyRewarded && !skipAll;

  const marker = skipAll
    ? alreadyRewarded
      ? existing!.lnurl_withdraw // não rebaixa quem já ganhou
      : "internal:skipped"
    : "internal:balance";

  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from("user_missions").insert({
      user_id: session.userId,
      mission_id: mission.id,
      withdrawn_at: new Date().toISOString(),
      lnurl_withdraw: marker,
    });
    if (insertError) {
      console.error("[missions/submit] erro ao criar user_missions", {
        userId: session.userId,
        slug,
        error: insertError,
      });
    }
  } else if (!alreadyRewarded) {
    // pulou antes → agora concluiu (ou pulou de novo)
    const { error: updateMissionError } = await supabaseAdmin
      .from("user_missions")
      .update({
        completed_at: new Date().toISOString(),
        withdrawn_at: new Date().toISOString(),
        lnurl_withdraw: marker,
      })
      .eq("user_id", session.userId)
      .eq("mission_id", mission.id);
    if (updateMissionError) {
      console.error("[missions/submit] erro ao fechar user_missions", {
        userId: session.userId,
        slug,
        error: updateMissionError,
      });
    }
  }
  // se alreadyRewarded: só prática — não mexe no registro de recompensa

  let satsCredited = 0;
  let xpGained = 0;

  const { data: user, error: userSelectError } = await supabaseAdmin
    .from("users")
    .select("xp, sats_balance")
    .eq("id", session.userId)
    .single();

  if (userSelectError) {
    console.error("[missions/submit] erro ao ler users", {
      userId: session.userId,
      error: userSelectError,
    });
  }

  let satsBalance = user?.sats_balance ?? 0;

  if (firstReward) {
    xpGained = graded.correctCount * 2;
    const userUpdate: Record<string, number> = { xp: (user?.xp ?? 0) + xpGained };

    // Tenta ler o que já foi creditado incrementalmente (via /check).
    const { data: progressRow, error: progressReadError } = await supabaseAdmin
      .from("user_missions")
      .select("sats_credited")
      .eq("user_id", session.userId)
      .eq("mission_id", mission.id)
      .maybeSingle();

    if (progressReadError) {
      // Migração supabase/migration_incremental_sats.sql ainda não rodou:
      // /api/missions/check não creditou nada incrementalmente nesta sessão.
      // Fallback: credita tudo agora (comportamento antigo), pra não perder o
      // caminho "mentoria completa sem interrupção" enquanto a migração não sobe.
      console.error(
        "[missions/submit] coluna sats_credited indisponível — rode supabase/migration_incremental_sats.sql. Creditando via fallback (tudo de uma vez).",
        { userId: session.userId, slug, error: progressReadError },
      );
      satsCredited = graded.satsEarned;
      satsBalance = satsBalance + satsCredited;
      userUpdate.sats_balance = satsBalance;

      if (satsCredited > 0) {
        await recordSatsMovement({
          userId: session.userId,
          kind: "in",
          amountSats: satsCredited,
          source: "mission",
          label:
            slug === MISSION_1_SLUG
              ? "Mentoria 1 · crédito ao concluir"
              : "Mentoria 2 · crédito ao concluir",
          refKey: `mission:${slug}:submit-fallback`,
          meta: { slug, fallback: true, sats: satsCredited },
        });
      }
    } else {
      // Caminho normal: sats já entraram em users.sats_balance a cada resposta.
      satsCredited = progressRow?.sats_credited ?? 0;
    }

    const { error: xpError } = await supabaseAdmin
      .from("users")
      .update(userUpdate)
      .eq("id", session.userId);

    if (xpError) {
      console.error("[missions/submit] erro ao gravar xp/sats_balance", {
        userId: session.userId,
        error: xpError,
      });
    }
  }

  console.log("[missions/submit] fechamento da missão", {
    userId: session.userId,
    slug,
    firstReward,
    satsCredited,
    sats_balance: satsBalance,
  });

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
