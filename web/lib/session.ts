// lib/session.ts — JWT de sessão assinado com o segredo do Supabase.
// Truque central: sub = users.id e role = "authenticated" fazem o
// auth.uid() do Postgres funcionar → RLS nativo, isolamento de contexto real.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "bitcoinos_session";
const SESSION_HOURS = 12;

function secret() {
  return new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
}

export async function createSession(userId: string, npub: string) {
  const jwt = await new SignJWT({ role: "authenticated", npub })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience("authenticated")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());

  cookies().set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function getSession(): Promise<{ userId: string; npub: string } | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { audience: "authenticated" });
    return { userId: payload.sub as string, npub: (payload as any).npub as string };
  } catch {
    return null;
  }
}

export function destroySession() {
  cookies().delete(SESSION_COOKIE);
}
