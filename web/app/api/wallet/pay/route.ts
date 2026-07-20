// POST /api/wallet/pay — O CORAÇÃO DA DEMO: envio pela carteira do usuário
// com FRICÇÃO COMPORTAMENTAL antes de executar.
//
// Fluxo em duas fases:
//   1ª chamada (sem confirm): decodifica o valor → checa o padrão →
//      se fora do padrão, devolve { friction: true, message } SEM PAGAR.
//   2ª chamada (confirm: true): executa o pagamento via NWC e registra
//      no histórico. A decisão é SEMPRE do usuário — nunca bloqueamos.
import { NextRequest, NextResponse } from "next/server";
import { decode } from "light-bolt11-decoder";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { decryptSecret } from "@/lib/crypto";
import { payInvoiceViaNwc } from "@/lib/nwc";
import { checkBehavior, recordSend } from "@/lib/comportamental";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "faça login" }, { status: 401 });

  let body: { bolt11?: string; confirm?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const bolt11 = body.bolt11?.trim();
  if (!bolt11) return NextResponse.json({ error: "cole a cobrança a pagar" }, { status: 400 });

  // Valor do invoice
  let amountSats: number;
  try {
    const decoded = decode(bolt11);
    const amountSection = decoded.sections.find((s: any) => s.name === "amount");
    amountSats = Math.floor(Number(amountSection?.value ?? 0) / 1000);
  } catch {
    return NextResponse.json({ error: "cobrança inválida" }, { status: 400 });
  }
  if (amountSats <= 0) {
    return NextResponse.json({ error: "cobrança sem valor definido" }, { status: 400 });
  }

  // Carteira conectada?
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

  // FASE 1 — fricção comportamental (antes de qualquer execução)
  if (!body.confirm) {
    const check = await checkBehavior(session.userId, amountSats);
    if (check.friction) {
      return NextResponse.json({
        friction: true,
        message: check.message,
        stats: {
          valorSats: check.amountSats,
          mediaSats: check.mediaSats,
          historico: check.historico,
        },
      });
    }
  }

  // FASE 2 — executa (dentro do padrão, ou usuário confirmou conscientemente)
  const result = await payInvoiceViaNwc(decryptSecret(conn.connection_secret_enc), bolt11);

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "pagamento falhou" }, { status: 502 });
  }

  await recordSend(session.userId, amountSats);

  return NextResponse.json({ ok: true, amountSats });
}
