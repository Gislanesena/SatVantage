// POST /api/auth/register — cria a conta iniciante.
// Recebe: username, pubkey, cofre cifrado E a pergunta de segurança
// (com a resposta JÁ HASHEADA no navegador — nunca em claro).
import { NextRequest, NextResponse } from "next/server";
import { nip19 } from "nostr-tools";
import { supabaseAdmin } from "@/lib/supabase";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  let body: {
    username?: string;
    pubkey?: string;
    vaultBlob?: string;
    vaultSalt?: string;
    securityQuestion?: string;
    answerHash?: string;
    qaSalt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const username = body.username?.trim().toLowerCase();
  const question = body.securityQuestion?.trim();
  const { pubkey, vaultBlob, vaultSalt, answerHash, qaSalt } = body;

  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "usuário inválido (3-20 caracteres: letras minúsculas, números, _)" },
      { status: 400 }
    );
  }
  if (!pubkey || !/^[0-9a-f]{64}$/.test(pubkey) || !vaultBlob || !vaultSalt) {
    return NextResponse.json({ error: "dados incompletos" }, { status: 400 });
  }
  if (!question || question.length < 8 || !answerHash || !qaSalt) {
    return NextResponse.json(
      { error: "pergunta de segurança e resposta são obrigatórias" },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .insert({
      username,
      pubkey,
      npub: nip19.npubEncode(pubkey),
      vault_nsec_enc: vaultBlob,
      vault_salt: vaultSalt,
      security_question: question,
      security_answer_hash: answerHash,
      qa_salt: qaSalt,
      knowledge_level: "iniciante",
      is_demo: false,
    })
    .select("id")
    .single();

  if (error) {
    const dup = error.code === "23505";
    return NextResponse.json(
      {
        error: dup
          ? "Esse usuário já está em uso. Escolha outro nome."
          : "erro ao criar conta",
      },
      { status: dup ? 409 : 500 }
    );
  }

  return NextResponse.json({ ok: true, userId: user.id });
}
