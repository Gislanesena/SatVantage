// GET /api/rewards/ledger — extrato real de sats do usuário logado.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listSatsMovements } from "@/lib/sats-ledger";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "faça login" }, { status: 401 });
  }

  const items = await listSatsMovements(session.userId, 50);

  return NextResponse.json({
    items: items.map((row) => ({
      id: row.id,
      kind: row.kind,
      sats: row.amount_sats,
      source: row.source,
      label: row.label,
      when: row.created_at,
    })),
  });
}
