// POST /api/wallet/connect — usuário cola a credencial NWC da carteira dele.
// Testamos a conexão, CIFRAMOS o segredo (AES-GCM) e guardamos.
// A credencial nunca volta ao cliente nem aparece em logs.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { testConnection, normalizeNwcUrl } from "@/lib/nwc";
import { encryptSecret } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  let body: { connectionString?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const cs = normalizeNwcUrl(body.connectionString || "");
  if (!cs || !cs.startsWith("nostr+walletconnect://")) {
    return NextResponse.json(
      { error: "credencial inválida — ela começa com nostr+walletconnect://" },
      { status: 400 },
    );
  }

  // Testa de verdade antes de guardar
  const test = await testConnection(cs);
  if (!test.ok) {
    return NextResponse.json(
      {
        error:
          test.error ||
          "não conseguimos falar com a carteira — deixe-a aberta/online e tente de novo",
      },
      { status: 400 },
    );
  }

  // Uma conexão ativa por usuário (revoga anteriores)
  await supabaseAdmin
    .from("nwc_connections")
    .update({ revoked_at: new Date().toISOString(), connection_secret_enc: null })
    .eq("user_id", session.userId)
    .is("revoked_at", null);

  let connection_secret_enc: string;
  try {
    connection_secret_enc = encryptSecret(cs);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "falha ao cifrar credencial — confira NWC_ENCRYPTION_KEY" },
      { status: 500 },
    );
  }

  const { error } = await supabaseAdmin.from("nwc_connections").insert({
    user_id: session.userId,
    label: body.label?.trim() || "Minha carteira",
    connection_secret_enc,
  });

  if (error) return NextResponse.json({ error: "erro ao salvar conexão" }, { status: 500 });

  return NextResponse.json({ ok: true, balanceSats: test.balanceSats });
}
