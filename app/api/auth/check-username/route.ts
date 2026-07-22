// POST /api/auth/check-username — verifica se o usuário já existe (criar conta).
// Resposta mínima: { available, reason? }. Sem dados sensíveis.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  let body: { username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const username = body.username?.trim().toLowerCase() ?? "";
  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json({
      available: false,
      reason: "usuário inválido (3-20 caracteres: letras minúsculas, números, _)",
    });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "erro ao verificar usuário" }, { status: 500 });
  }

  if (data) {
    return NextResponse.json({
      available: false,
      reason: "Esse usuário já está em uso. Escolha outro nome.",
    });
  }

  return NextResponse.json({ available: true });
}
