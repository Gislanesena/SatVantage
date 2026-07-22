// POST /api/emergency/activate — Modo Emergência.
// Exige a resposta da pergunta de segurança (hash calculado no navegador, igual à
// recuperação de senha) antes de executar qualquer coisa. Confirmado:
//   1. Revoga TODAS as conexões NWC ativas do usuário — apaga o segredo cifrado
//      do banco (revogar = apagar, não só marcar flag; mesma ação do "Revogar"
//      em Enviar, ver /api/wallet/disconnect).
//   2. Registra o evento em emergency_events (auditoria).
// Corretoras são só ilustrativas nesta versão (sem API real) — o front desconecta
// o mock local ao receber { ok: true }.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  let body: { answerHash?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const answerHash = body.answerHash;
  if (!answerHash) {
    return NextResponse.json({ error: "resposta ausente" }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("security_answer_hash")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user?.security_answer_hash) {
    return NextResponse.json(
      { error: "esta conta não tem pergunta de segurança configurada" },
      { status: 400 },
    );
  }

  if (user.security_answer_hash !== answerHash) {
    return NextResponse.json({ error: "resposta não confere" }, { status: 401 });
  }

  const { error: revokeError } = await supabaseAdmin
    .from("nwc_connections")
    .update({ revoked_at: new Date().toISOString(), connection_secret_enc: null })
    .eq("user_id", session.userId)
    .is("revoked_at", null);

  if (revokeError) {
    console.error("[emergency/activate] erro ao revogar nwc_connections", {
      userId: session.userId,
      error: revokeError,
    });
  }

  const { error: eventError } = await supabaseAdmin.from("emergency_events").insert({
    user_id: session.userId,
    actions: ["nwc_revogado", "corretoras_desconectadas"],
  });

  if (eventError) {
    console.error("[emergency/activate] erro ao registrar emergency_events", {
      userId: session.userId,
      error: eventError,
    });
  }

  return NextResponse.json({ ok: true });
}
