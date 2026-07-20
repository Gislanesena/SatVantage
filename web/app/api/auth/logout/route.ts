// POST /api/auth/logout — encerra a sessão de verdade (apaga o cookie).
// Antes deste endpoint, "Sair" só limpava o estado do navegador — o cookie
// httpOnly de 12h continuava válido no servidor.
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  destroySession();
  return NextResponse.json({ ok: true });
}
