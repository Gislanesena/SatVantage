// POST /api/wallet/invoice — gera cobrança na carteira NWC do usuário (receber).
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { decryptSecret } from "@/lib/crypto";
import { makeInvoiceViaNwc } from "@/lib/nwc";
import { isMutinyNetBolt11, MUTINYNET_WALLET_MSG } from "@/lib/mutinynet";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  let body: { amountSats?: number; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const amountSats = Number(body.amountSats);
  if (!Number.isFinite(amountSats) || amountSats < 1 || amountSats > 2_000_000) {
    return NextResponse.json({ error: "informe um valor em sats válido" }, { status: 400 });
  }

  const { data: conn } = await supabaseAdmin
    .from("nwc_connections")
    .select("connection_secret_enc")
    .eq("user_id", session.userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!conn?.connection_secret_enc) {
    return NextResponse.json({ error: "conecte uma carteira primeiro" }, { status: 400 });
  }

  const result = await makeInvoiceViaNwc(
    decryptSecret(conn.connection_secret_enc),
    Math.floor(amountSats),
    body.description?.trim() || "Recebimento SatVantage (MutinyNet)",
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "falha ao gerar cobrança" }, { status: 502 });
  }

  if (!result.invoice || !isMutinyNetBolt11(result.invoice)) {
    return NextResponse.json(
      {
        error:
          MUTINYNET_WALLET_MSG +
          " A cobrança gerada não é MutinyNet (lntbs). Conecte uma carteira de teste.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, invoice: result.invoice, amountSats: Math.floor(amountSats) });
}
