// POST /api/auth/recovery-info — primeiro passo do "esqueci minha senha":
// devolve a pergunta de segurança e o salt da resposta para o navegador
// poder recomputar o hash. Erro genérico se a conta não existir.
// Produção: rate-limit por IP.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: { username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const username = body.username?.trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "usuário ausente" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("users")
    .select("security_question, qa_salt")
    .eq("username", username)
    .maybeSingle();

  if (!data?.security_question || !data?.qa_salt) {
    return NextResponse.json({ error: "não foi possível iniciar a recuperação" }, { status: 401 });
  }

  return NextResponse.json({ question: data.security_question, qaSalt: data.qa_salt });
}
