// POST /api/auth/vault — devolve o cofre cifrado para o login diário.
// O blob é inútil sem a senha (decifragem só no navegador).
// Produção: adicionar rate-limit por IP.
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

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("vault_nsec_enc, vault_salt")
    .eq("username", username)
    .maybeSingle();

  if (error || !data?.vault_nsec_enc) {
    // Genérico de propósito: não revelar se o usuário existe (anti-enumeração)
    return NextResponse.json({ error: "usuário ou senha incorretos" }, { status: 401 });
  }

  return NextResponse.json({ vaultBlob: data.vault_nsec_enc, vaultSalt: data.vault_salt });
}
