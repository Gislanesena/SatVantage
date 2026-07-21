// POST /api/auth/login → recebe o evento Nostr assinado, valida tudo e abre sessão.
//
// Proteções implementadas (bater com o checklist de testes):
//  · assinatura Schnorr verificada (verifyEvent)
//  · challenge existe, não expirou e nunca foi usado (anti-replay)
//  · challenge marcado como usado ANTES de criar a sessão (uso único)
import { NextRequest, NextResponse } from "next/server";
import type { Event } from "nostr-tools";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyLoginEvent } from "@/lib/nostr";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  let body: { event?: Event; isDemo?: boolean; via?: "extension" | "vault" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const event = body.event;
  if (!event) {
    return NextResponse.json({ error: "evento ausente" }, { status: 400 });
  }

  // 1. Extrai o challenge declarado no evento
  const challenge = event.tags?.find((t) => t[0] === "challenge")?.[1];
  if (!challenge) {
    return NextResponse.json({ error: "challenge ausente" }, { status: 400 });
  }

  // 2. Consome o challenge de forma atômica: só passa se existir,
  //    não estiver usado e não estiver expirado. (anti-replay)
  const { data: consumed, error: consumeError } = await supabaseAdmin
    .from("auth_challenges")
    .update({ used: true })
    .eq("challenge", challenge)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .select("challenge")
    .maybeSingle();

  if (consumeError || !consumed) {
    return NextResponse.json(
      { error: "desafio inválido, expirado ou já utilizado" },
      { status: 401 }
    );
  }

  // 3. Verificação criptográfica da assinatura + estrutura do evento
  const check = verifyLoginEvent(event, challenge);
  if (!check.ok || !check.pubkey || !check.npub) {
    return NextResponse.json({ error: check.error ?? "evento inválido" }, { status: 401 });
  }

  // 4. Upsert do usuário pela pubkey (identidade = par de chaves).
  // Extensão Nostr = já tem autocustódia → intermediário (Missão 1 é só iniciante).
  const row: {
    pubkey: string;
    npub: string;
    is_demo: boolean;
    knowledge_level?: "iniciante" | "intermediario" | "avancado";
  } = {
    pubkey: check.pubkey,
    npub: check.npub,
    is_demo: body.isDemo === true,
  };
  if (body.via === "extension") {
    row.knowledge_level = "intermediario";
  }

  const { data: user, error: upsertError } = await supabaseAdmin
    .from("users")
    .upsert(row, { onConflict: "pubkey" })
    .select("id, npub, display_name, knowledge_level, xp")
    .single();

  if (upsertError || !user) {
    return NextResponse.json({ error: "erro ao registrar usuário" }, { status: 500 });
  }

  // 5. Sessão JWT (sub = user.id → auth.uid() → RLS)
  await createSession(user.id, user.npub);

  return NextResponse.json({
    user: {
      npub: user.npub,
      displayName: user.display_name,
      knowledgeLevel: user.knowledge_level,
      xp: user.xp,
    },
  });
}
