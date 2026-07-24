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

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "[check-username] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente no .env.local",
    );
    return NextResponse.json(
      {
        error: "erro ao verificar usuário",
        reason: "configuração do servidor incompleta",
      },
      { status: 500 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("[check-username] supabase", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const invalidKey = /invalid api key/i.test(error.message ?? "");
    return NextResponse.json(
      {
        error: "erro ao verificar usuário",
        reason: invalidKey
          ? "chave Supabase inválida — confira SUPABASE_SERVICE_ROLE_KEY no .env.local"
          : undefined,
      },
      { status: 500 },
    );
  }

  if (data) {
    return NextResponse.json({
      available: false,
      reason: "Esse usuário já está em uso. Escolha outro nome.",
    });
  }

  return NextResponse.json({ available: true });
}
