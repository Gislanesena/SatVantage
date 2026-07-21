// GET /api/auth/session — restaura a sessão existente (cookie httpOnly de 12h)
// sem exigir login de novo. Usado quando a página carrega/dá F5.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("npub, display_name, knowledge_level, xp")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      npub: user.npub,
      displayName: user.display_name,
      knowledgeLevel: user.knowledge_level,
      xp: user.xp,
    },
  });
}
