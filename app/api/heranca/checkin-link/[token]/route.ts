// GET /api/heranca/checkin-link/[token] — público, 1 clique, sem login
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { appBaseUrl } from "@/lib/heranca";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const token = params.token?.trim();
  const base = appBaseUrl();

  if (!token) {
    return NextResponse.redirect(`${base}/heranca/checkin-ok?ok=0`);
  }

  const { data: plan } = await supabaseAdmin
    .from("inheritance_plans")
    .select("id")
    .eq("checkin_token", token)
    .maybeSingle();

  if (!plan) {
    return NextResponse.redirect(`${base}/heranca/checkin-ok?ok=0`);
  }

  const now = new Date().toISOString();
  await supabaseAdmin
    .from("inheritance_plans")
    .update({
      last_checkin_at: now,
      reminder_stage: 0,
      updated_at: now,
    })
    .eq("id", plan.id);

  return NextResponse.redirect(`${base}/heranca/checkin-ok?ok=1`);
}
