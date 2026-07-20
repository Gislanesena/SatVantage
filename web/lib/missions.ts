/** Constantes de missão — seguro no cliente (sem gabarito). */
export const MISSION_1_SLUG = "primeiros-passos" as const;
export const MISSION_2_SLUG = "primeira-carteira" as const;

export type MissionSlug = typeof MISSION_1_SLUG | typeof MISSION_2_SLUG;

export function isMissionSlug(s: unknown): s is MissionSlug {
  return s === MISSION_1_SLUG || s === MISSION_2_SLUG;
}
