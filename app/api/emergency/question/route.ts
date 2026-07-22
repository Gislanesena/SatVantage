// GET /api/emergency/question — pergunta de segurança do usuário LOGADO (via sessão,
// não por username) + salt, para o navegador recomputar o hash da resposta.
// Mesma prova usada na recuperação de senha, reaproveitada como confirmação de identidade
// antes de ativar o Modo Emergência.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("security_question, qa_salt")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user?.security_question || !user?.qa_salt) {
    return NextResponse.json({ question: null, qaSalt: null });
  }

  return NextResponse.json({ question: user.security_question, qaSalt: user.qa_salt });
}
