// POST /api/missions/check — feedback de UMA pergunta + crédito imediato dos sats.
// Antes, o crédito só acontecia no /api/missions/submit (fim da mentoria inteira);
// qualquer interrupção no meio perdia tudo. Agora cada resposta credita na hora,
// e a coluna user_missions.progress registra QUAIS índices já foram creditados
// para não dobrar o saldo se a mesma pergunta for respondida de novo (ex.: F5).
//
// A consulta de `lnurl_withdraw` (trava anti-farm) fica separada da consulta de
// `progress`/`sats_credited` (colunas novas, de supabase/migration_incremental_sats.sql)
// de propósito: se a migração ainda não rodou, a segunda consulta falha, mas a
// trava anti-farm continua funcionando — e o crédito incremental fica desligado
// (loga erro claro) em vez de creditar sem proteção contra duplicidade.
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
import { recordSatsMovement } from "@/lib/sats-ledger";

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

  let satsCredited = 0;
  let satsBalance: number | undefined;

  try {
    const mission = await ensureMission(slug);

    // 1) Trava anti-farm — nunca deve quebrar, mesmo sem a migração nova.
    const { data: base, error: baseError } = await supabaseAdmin
      .from("user_missions")
      .select("lnurl_withdraw")
      .eq("user_id", session.userId)
      .eq("mission_id", mission.id)
      .maybeSingle();

    if (baseError) {
      console.error("[missions/check] erro ao ler user_missions (lnurl_withdraw)", {
        userId: session.userId,
        slug,
        error: baseError,
      });
    }

    const alreadyRewarded = wasRewarded(base?.lnurl_withdraw);

    if (!alreadyRewarded) {
      // 2) Idempotência por pergunta — depende das colunas da migração nova.
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("user_missions")
        .select("progress, sats_credited")
        .eq("user_id", session.userId)
        .eq("mission_id", mission.id)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "[missions/check] colunas progress/sats_credited indisponíveis — rode supabase/migration_incremental_sats.sql. Crédito incremental DESATIVADO até lá.",
          { userId: session.userId, slug, error: fetchError },
        );
      } else {
        const progress: Record<string, { sats: number; correct: boolean }> =
          (existing?.progress as any) ?? {};
        const key = String(i);
        const alreadyCredited = Object.prototype.hasOwnProperty.call(progress, key);

        if (!alreadyCredited) {
          const { data: user, error: userSelectError } = await supabaseAdmin
            .from("users")
            .select("sats_balance")
            .eq("id", session.userId)
            .single();

          if (userSelectError) {
            console.error("[missions/check] erro ao ler sats_balance", {
              userId: session.userId,
              error: userSelectError,
            });
          }

          const newBalance = (user?.sats_balance ?? 0) + sats;

          const { error: balanceError } = await supabaseAdmin
            .from("users")
            .update({ sats_balance: newBalance })
            .eq("id", session.userId);

          if (balanceError) {
            console.error("[missions/check] ERRO ao gravar sats_balance — crédito NÃO aplicado", {
              userId: session.userId,
              slug,
              lessonIndex: i,
              sats,
              error: balanceError,
            });
          } else {
            satsCredited = sats;
            satsBalance = newBalance;
            console.log("[missions/check] sats creditados", {
              userId: session.userId,
              slug,
              lessonIndex: i,
              sats,
              sats_balance: newBalance,
            });

            await recordSatsMovement({
              userId: session.userId,
              kind: "in",
              amountSats: sats,
              source: "mission",
              label:
                slug === MISSION_1_SLUG
                  ? `Mentoria 1 · pergunta ${i + 1}`
                  : `Mentoria 2 · pergunta ${i + 1}`,
              refKey: `mission:${slug}:${i}`,
              meta: { slug, lessonIndex: i, correct, sats },
            });

            // Marca o índice como creditado (best-effort — o saldo já está gravado
            // acima, que é a fonte da verdade; se isto falhar, só logamos).
            const nextProgress = { ...progress, [key]: { sats, correct } };
            const nextSatsCredited = (existing?.sats_credited ?? 0) + sats;

            const { error: progressError } = await supabaseAdmin
              .from("user_missions")
              .upsert(
                {
                  user_id: session.userId,
                  mission_id: mission.id,
                  progress: nextProgress,
                  sats_credited: nextSatsCredited,
                },
                { onConflict: "user_id,mission_id" },
              );

            if (progressError) {
              console.error("[missions/check] erro ao gravar progress (saldo já creditado)", {
                userId: session.userId,
                slug,
                lessonIndex: i,
                error: progressError,
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("[missions/check] falha inesperada ao creditar", {
      userId: session.userId,
      slug,
      lessonIndex: i,
      error: e,
    });
  }

  return NextResponse.json({
    correct,
    feedback: correct ? q.feedbackCorrect : q.feedbackWrong,
    sats,
    satsCredited,
    satsBalance,
  });
}
