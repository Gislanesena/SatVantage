// POST /api/auth/recover — redefine a senha SEM e-mail e SEM suporte humano.
// Exige DUAS provas, juntas:
//   1. Chave de recuperação: assinatura Schnorr do desafio confere com a pubkey
//      da conta (prova matemática de posse).
//   2. Pergunta de segurança: hash da resposta (feito no navegador) confere
//      com o registrado (camada extra de defesa).
// O servidor nunca vê: senha antiga, senha nova, chave privada ou resposta em claro.
import { NextRequest, NextResponse } from "next/server";
import type { Event } from "nostr-tools";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyLoginEvent } from "@/lib/nostr";

export async function POST(req: NextRequest) {
  let body: {
    username?: string;
    event?: Event;
    answerHash?: string;
    vaultBlob?: string;
    vaultSalt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const username = body.username?.trim().toLowerCase();
  const { event, answerHash, vaultBlob, vaultSalt } = body;

  if (!username || !event || !answerHash || !vaultBlob || !vaultSalt) {
    return NextResponse.json({ error: "dados incompletos" }, { status: 400 });
  }

  // 1. Consome o challenge (anti-replay, atômico)
  const challenge = event.tags?.find((t) => t[0] === "challenge")?.[1];
  if (!challenge) {
    return NextResponse.json({ error: "challenge ausente" }, { status: 400 });
  }

  const { data: consumed } = await supabaseAdmin
    .from("auth_challenges")
    .update({ used: true })
    .eq("challenge", challenge)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .select("challenge")
    .maybeSingle();

  if (!consumed) {
    return NextResponse.json(
      { error: "desafio inválido, expirado ou já utilizado" },
      { status: 401 }
    );
  }

  // 2. Assinatura válida?
  const check = verifyLoginEvent(event, challenge);
  if (!check.ok || !check.pubkey) {
    return NextResponse.json({ error: "prova de posse inválida" }, { status: 401 });
  }

  // 3. Conta existe, pubkey bate E resposta de segurança bate?
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, pubkey, security_answer_hash")
    .eq("username", username)
    .maybeSingle();

  const pubkeyOk = user && user.pubkey === check.pubkey;
  const answerOk = user && user.security_answer_hash === answerHash;

  if (!pubkeyOk || !answerOk) {
    // Mensagem única de propósito: não dizer QUAL prova falhou
    return NextResponse.json(
      { error: "dados de recuperação não conferem com esta conta" },
      { status: 401 }
    );
  }

  // 4. Substitui o cofre (cifrado no cliente com a senha nova)
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({ vault_nsec_enc: vaultBlob, vault_salt: vaultSalt })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "erro ao atualizar o cofre" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
