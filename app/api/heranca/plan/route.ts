// GET/POST /api/heranca/plan — plano do usuário + herdeiros
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { minutosRestantesCheckin } from "@/lib/heranca";

export const dynamic = "force-dynamic";

async function loadPlanForUser(userId: string) {
  const { data: plan } = await supabaseAdmin
    .from("inheritance_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return { plan: null, heirs: [] as any[] };

  const { data: heirs } = await supabaseAdmin
    .from("heirs")
    .select("*")
    .eq("plan_id", plan.id)
    .order("name", { ascending: true });

  return { plan, heirs: heirs ?? [] };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  const { plan, heirs } = await loadPlanForUser(session.userId);
  if (!plan) {
    return NextResponse.json({ plan: null, heirs: [], diasRestantes: null, minutosRestantes: null });
  }

  const minutosRestantes = minutosRestantesCheckin(plan.last_checkin_at);
  return NextResponse.json({
    plan,
    heirs,
    minutosRestantes,
    /** Compat: UI antiga usava dias; agora o prazo é em minutos (demo). */
    diasRestantes: minutosRestantes,
  });
}

type HeirInput = {
  id?: string;
  name?: string;
  email?: string;
  telefone?: string;
  npub?: string;
  percent?: number;
  remove?: boolean;
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  let body: {
    titularEmail?: string | null;
    checkinIntervalDays?: number;
    heirs?: HeirInput[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  let { plan } = await loadPlanForUser(session.userId);

  if (!plan) {
    // Insert mínimo (schema base). Colunas da migration_heranca.sql vão no update abaixo.
    const { data: created, error } = await supabaseAdmin
      .from("inheritance_plans")
      .insert({
        user_id: session.userId,
        status: "rascunho",
      })
      .select("*")
      .single();
    if (error || !created) {
      console.error("[heranca/plan] create", error);
      return NextResponse.json(
        {
          error:
            error?.message ||
            "erro ao criar plano — confira se a tabela inheritance_plans existe no Supabase",
        },
        { status: 500 },
      );
    }
    plan = created;

    const extras: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      last_checkin_at: new Date().toISOString(),
      reminder_stage: 0,
      checkin_interval_days: Math.max(
        7,
        Math.min(3650, Number(body.checkinIntervalDays) || 90),
      ),
    };
    if (body.titularEmail !== undefined) {
      extras.titular_email = body.titularEmail?.trim() || null;
    }
    const { error: extraErr } = await supabaseAdmin
      .from("inheritance_plans")
      .update(extras)
      .eq("id", plan.id);
    if (extraErr) {
      // Migration ainda não rodou — plano criado, mas prova de vida completa exige SQL.
      console.warn("[heranca/plan] extras (rode migration_heranca.sql):", extraErr.message);
    }
  } else {
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.titularEmail !== undefined) {
      patch.titular_email = body.titularEmail?.trim() || null;
    }
    if (body.checkinIntervalDays != null) {
      patch.checkin_interval_days = Math.max(
        7,
        Math.min(3650, Number(body.checkinIntervalDays) || 90),
      );
    }
    // Editar herdeiros após carimbo → volta para revisão conceitual (não apaga carimbo antigo)
    if (body.heirs && plan.status === "carimbado") {
      patch.status = "revisao";
    }
    const { error: patchErr } = await supabaseAdmin
      .from("inheritance_plans")
      .update(patch)
      .eq("id", plan.id);
    if (patchErr) {
      console.error("[heranca/plan] update", patchErr);
      return NextResponse.json(
        {
          error:
            /column|titular_email|reminder_stage|checkin_/i.test(patchErr.message)
              ? "Falta rodar supabase/migration_heranca.sql no Supabase (colunas de prova de vida)."
              : patchErr.message,
        },
        { status: 500 },
      );
    }
  }

  if (Array.isArray(body.heirs)) {
    for (const h of body.heirs) {
      if (h.remove && h.id) {
        await supabaseAdmin.from("heirs").delete().eq("id", h.id).eq("plan_id", plan.id);
        continue;
      }

      const name = String(h.name || "").trim();
      const email = String(h.email || "").trim().toLowerCase();
      const percent = Number(h.percent);
      if (!name || !email || !Number.isFinite(percent) || percent <= 0) {
        return NextResponse.json(
          { error: "cada herdeiro precisa de nome, e-mail e percentual > 0" },
          { status: 400 },
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: `e-mail inválido: ${email}` }, { status: 400 });
      }

      const row = {
        name,
        email,
        telefone: h.telefone?.trim() || null,
        npub: h.npub?.trim() || null,
        percent,
        contacts_confirmed_at: new Date().toISOString(),
      };

      if (h.id) {
        const { error } = await supabaseAdmin
          .from("heirs")
          .update(row)
          .eq("id", h.id)
          .eq("plan_id", plan.id);
        if (error) {
          return NextResponse.json(
            { error: traduzirErroHeir(error.message) },
            { status: 400 },
          );
        }
      } else {
        const { error } = await supabaseAdmin.from("heirs").insert({
          plan_id: plan.id,
          ...row,
        });
        if (error) {
          // Fallback: schema antigo sem email/telefone
          if (/column.*email|telefone|contacts_confirmed/i.test(error.message)) {
            const { error: err2 } = await supabaseAdmin.from("heirs").insert({
              plan_id: plan.id,
              name,
              npub: h.npub?.trim() || null,
              percent,
            });
            if (err2) {
              return NextResponse.json(
                { error: traduzirErroHeir(err2.message) },
                { status: 400 },
              );
            }
            console.warn(
              "[heranca/plan] herdeiro sem e-mail no banco — rode migration_heranca.sql",
            );
          } else {
            return NextResponse.json(
              { error: traduzirErroHeir(error.message) },
              { status: 400 },
            );
          }
        }
      }
    }
  }

  const fresh = await loadPlanForUser(session.userId);
  const minutosRestantes = fresh.plan
    ? minutosRestantesCheckin(fresh.plan.last_checkin_at)
    : null;
  return NextResponse.json({
    plan: fresh.plan,
    heirs: fresh.heirs,
    minutosRestantes,
    diasRestantes: minutosRestantes,
  });
}

function traduzirErroHeir(msg: string): string {
  if (/excede 100|percent/i.test(msg)) {
    return "A soma dos percentuais dos herdeiros não pode passar de 100%.";
  }
  if (/column.*email|does not exist/i.test(msg)) {
    return "Falta rodar supabase/migration_heranca.sql no Supabase (colunas dos herdeiros).";
  }
  return msg || "não foi possível salvar o herdeiro";
}
