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
    title: "Primeiros Passos no Bitcoin",
    description:
      "Bitcoin, golpes, carteira e imposto — conversa introdutória com o Mentor.",
    xp_reward: 20,
    // Máximo teórico se acertar as 4 perguntas (4 × 5). Só metadata de seed; o crédito real é por resposta.
    sats_reward: 20,
  },
  [MISSION_2_SLUG]: {
    title: "Corretoras e Lightning",
    description:
      "Corretoras, Lightning, autocustódia e carteira fria — no seu ritmo.",
    xp_reward: 20,
    sats_reward: 20,
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
