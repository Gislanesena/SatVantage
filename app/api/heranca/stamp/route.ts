// POST/GET /api/heranca/stamp — carimbar / verificar OpenTimestamps
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import {
  carimbarHash,
  gerarDocumentoPlano,
  hashDocumento,
  verificarCarimbo,
} from "@/lib/heranca";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
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
    return NextResponse.json({ error: "crie o plano e cadastre herdeiros antes" }, { status: 400 });
  }

  const { data: heirs } = await supabaseAdmin
    .from("heirs")
    .select("*")
    .eq("plan_id", plan.id);

  if (!heirs?.length) {
    return NextResponse.json(
      { error: "cadastre pelo menos um herdeiro antes de carimbar" },
      { status: 400 },
    );
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("npub")
    .eq("id", session.userId)
    .single();

  const texto = gerarDocumentoPlano({
    planId: plan.id,
    titularNpub: user?.npub || session.npub,
    createdAt: plan.created_at,
    heirs: heirs.map((h) => ({
      name: h.name,
      percent: Number(h.percent),
      email: h.email,
      telefone: h.telefone,
      npub: h.npub,
    })),
  });
  const hash = hashDocumento(texto);

  try {
    const ots = await carimbarHash(hash);
    const { error } = await supabaseAdmin
      .from("inheritance_plans")
      .update({
        doc_sha256: hash,
        ots_receipt: ots,
        status: "carimbado",
        stamped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      docSha256: hash,
      status: "carimbado",
      verificacao: {
        status: "pendente",
        mensagem:
          "Carimbo enviado. A confirmação na blockchain pode levar algumas horas.",
      },
    });
  } catch (e: any) {
    console.error("[heranca/stamp]", e);
    return NextResponse.json(
      { error: e?.message || "falha ao carimbar na OpenTimestamps" },
      { status: 502 },
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  const { data: plan } = await supabaseAdmin
    .from("inheritance_plans")
    .select("doc_sha256, ots_receipt, status, stamped_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan?.doc_sha256 || !plan?.ots_receipt) {
    return NextResponse.json({
      status: "rascunho",
      mensagem: "Plano ainda não foi carimbado.",
    });
  }

  const verificacao = await verificarCarimbo(plan.doc_sha256, plan.ots_receipt);
  return NextResponse.json({
    ...verificacao,
    docSha256: plan.doc_sha256,
    stampedAt: plan.stamped_at,
    planStatus: plan.status,
  });
}
