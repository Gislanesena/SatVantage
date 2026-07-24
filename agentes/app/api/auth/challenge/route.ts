// POST /api/auth/challenge → gera desafio único com validade curta.
// O cliente vai assinar esse texto com a extensão Nostr (NIP-07).
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { CHALLENGE_TTL_SECONDS } from "@/lib/nostr";

export async function POST() {
  const challenge = `bitcoinos-login-${randomBytes(16).toString("hex")}`;
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("auth_challenges")
    .insert({ challenge, expires_at: expiresAt });

  if (error) {
    console.error("SUPABASE ERROR:", error);
    return NextResponse.json({ error: "erro ao criar desafio" }, { status: 500 });
  }

  return NextResponse.json({ challenge, expiresInSeconds: CHALLENGE_TTL_SECONDS });
}
