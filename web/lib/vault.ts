// lib/vault.ts — criptografia do lado do CLIENTE (WebCrypto).
// 1. Cofre da chave privada: PBKDF2(senha) -> AES-256-GCM.
// 2. Hash da resposta de segurança: PBKDF2(resposta normalizada).
// Nada disso acontece no servidor: senha e resposta nunca saem do navegador.

const VAULT_ITERATIONS = 600_000;
const ANSWER_ITERATIONS = 200_000;

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function importPassword(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey", "deriveBits"]
  );
}

async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await importPassword(password);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: VAULT_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Cifra a chave privada com a senha. Retorna { blob, salt } em base64. */
export async function sealVault(
  secretKey: Uint8Array,
  password: string
): Promise<{ blob: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    secretKey as BufferSource
  );
  return { blob: `${toB64(iv)}.${toB64(ct)}`, salt: toB64(salt) };
}

/** Decifra o cofre com a senha. Lança erro se a senha estiver errada. */
export async function openVault(
  blob: string,
  saltB64: string,
  password: string
): Promise<Uint8Array> {
  const [ivB64, ctB64] = blob.split(".");
  if (!ivB64 || !ctB64) throw new Error("cofre corrompido");
  const key = await deriveAesKey(password, fromB64(saltB64));
  try {
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(ivB64) as BufferSource },
      key,
      fromB64(ctB64) as BufferSource
    );
    return new Uint8Array(pt);
  } catch {
    throw new Error("senha incorreta");
  }
}

/** Normaliza a resposta: minúsculas, sem acentos, espaços colapsados. */
export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Gera um salt novo (base64) para o hash da resposta. */
export function newSalt(): string {
  return toB64(crypto.getRandomValues(new Uint8Array(16)));
}

/** Hash da resposta de segurança — feito no NAVEGADOR. */
export async function hashAnswer(answer: string, saltB64: string): Promise<string> {
  const material = await importPassword(normalizeAnswer(answer));
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromB64(saltB64) as BufferSource,
      iterations: ANSWER_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    256
  );
  return toB64(bits);
}
