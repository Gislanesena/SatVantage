// lib/nostr.ts — verificação do evento de login (padrão NIP-42 adaptado a HTTP)
import { verifyEvent, type Event } from "nostr-tools";
import { nip19 } from "nostr-tools";

export const LOGIN_EVENT_KIND = 22242; // mesmo kind do NIP-42 (auth)
export const CHALLENGE_TTL_SECONDS = 60;

export interface LoginCheckResult {
  ok: boolean;
  pubkey?: string; // hex
  npub?: string;
  error?: string;
}

/**
 * Verifica o evento assinado enviado pelo cliente:
 * 1. Assinatura Schnorr válida (id + sig conferem com o pubkey)
 * 2. Kind correto
 * 3. Tag ["challenge", <challenge>] presente e igual ao esperado
 * 4. created_at dentro da janela de tolerância
 */
export function verifyLoginEvent(event: Event, expectedChallenge: string): LoginCheckResult {
  if (event.kind !== LOGIN_EVENT_KIND) {
    return { ok: false, error: "kind inválido" };
  }

  const challengeTag = event.tags.find((t) => t[0] === "challenge");
  if (!challengeTag || challengeTag[1] !== expectedChallenge) {
    return { ok: false, error: "challenge ausente ou não confere" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - event.created_at) > CHALLENGE_TTL_SECONDS * 2) {
    return { ok: false, error: "evento fora da janela de tempo" };
  }

  // Verificação criptográfica: só o dono da chave privada produz essa assinatura
  if (!verifyEvent(event)) {
    return { ok: false, error: "assinatura inválida" };
  }

  return {
    ok: true,
    pubkey: event.pubkey,
    npub: nip19.npubEncode(event.pubkey),
  };
}
