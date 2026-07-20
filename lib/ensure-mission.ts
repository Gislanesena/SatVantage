// Garante que a linha da missão existe no Supabase (seed lazy).
import { supabaseAdmin } from "@/lib/supabase";
import {
  MISSION_1_SLUG,
  MISSION_2_SLUG,
  type MissionSlug,
} from "@/lib/missions";

const META: Record<
  MissionSlug,
  { title: string; description: string; xp_reward: number; sats_reward: number }
> = {
  [MISSION_1_SLUG]: {
    title: "O que é Bitcoin?",
    description: "Conversa introdutória com o Mentor.",
    xp_reward: 20,
    sats_reward: 25,
  },
  [MISSION_2_SLUG]: {
    title: "Carteira e Lightning",
    description:
      "Aprenda o que é carteira, seed e pagamentos Lightning — no seu ritmo.",
    xp_reward: 20,
    sats_reward: 25,
  },
};

export async function ensureMission(slug: MissionSlug) {
  const { data: existing } = await supabaseAdmin
    .from("missions")
    .select("id, slug, title, description, xp_reward")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return existing;

  const meta = META[slug];
  const { data: inserted, error } = await supabaseAdmin
    .from("missions")
    .insert({
      slug,
      title: meta.title,
      description: meta.description,
      xp_reward: meta.xp_reward,
      sats_reward: meta.sats_reward,
      unlocks: null,
    })
    .select("id, slug, title, description, xp_reward")
    .single();

  if (error || !inserted) {
    // Corrida: outra request inseriu — tenta de novo
    const { data: again } = await supabaseAdmin
      .from("missions")
      .select("id, slug, title, description, xp_reward")
      .eq("slug", slug)
      .maybeSingle();
    if (again) return again;
    throw new Error(error?.message ?? "falha ao criar missão");
  }

  return inserted;
}
