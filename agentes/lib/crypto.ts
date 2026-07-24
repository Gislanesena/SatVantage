// lib/crypto.ts — AES-256-GCM para segredos NWC antes de gravar no banco.
// Chave em NWC_ENCRYPTION_KEY (32 bytes hex → openssl rand -hex 32).
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function key(): Buffer {
  const raw = process.env.NWC_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error("NWC_ENCRYPTION_KEY ausente no .env.local");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error(
      "NWC_ENCRYPTION_KEY inválida — precisa ser 64 caracteres hex (32 bytes). Gere com: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return Buffer.from(raw, "hex");
}

/** Retorna base64(iv || ciphertext || authTag) */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, enc, cipher.getAuthTag()]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(raw.length - 16);
  const data = raw.subarray(12, raw.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
