/**
 * Build-time / env-driven feature flags for scope-creep modules.
 *
 * Distinct from `useFeatureFlags` (DB-driven, per-subscription-plan): these
 * flags decide whether a whole module ships at all in a given build. They
 * mirror the "Décision A: Périmètre fonctionnel" of AUDIT_20260507 § 5.
 *
 * Defaults:
 *   - in DEV (`import.meta.env.DEV`): all flags ON
 *   - in PROD: scope-creep modules OFF unless explicitly enabled via the
 *     corresponding `VITE_FEATURE_*` env var set to `"true"` at build time
 */

export type BuildFlagKey =
  | 'AI_CMO'
  | 'BLOG_AUTO'
  | 'SOCIAL_BOOSTER'
  | 'LANDING_BUILDER'
  | 'GAMIFICATION'
  | 'QUALIREPAR_V1'
  | 'QUALIREPAR_V2';

const ENV_PREFIX = 'VITE_FEATURE_';

function readEnvFlag(key: BuildFlagKey, fallback: boolean): boolean {
  const raw = (import.meta.env as Record<string, string | undefined>)[`${ENV_PREFIX}${key}`];
  if (raw === undefined || raw === '') return fallback;
  return raw === 'true' || raw === '1';
}

const isDev: boolean = Boolean(import.meta.env.DEV);

export const BUILD_FLAGS: Record<BuildFlagKey, boolean> = {
  AI_CMO: readEnvFlag('AI_CMO', isDev),
  BLOG_AUTO: readEnvFlag('BLOG_AUTO', isDev),
  SOCIAL_BOOSTER: readEnvFlag('SOCIAL_BOOSTER', isDev),
  LANDING_BUILDER: readEnvFlag('LANDING_BUILDER', isDev),
  GAMIFICATION: readEnvFlag('GAMIFICATION', isDev),
  QUALIREPAR_V1: readEnvFlag('QUALIREPAR_V1', false),
  QUALIREPAR_V2: readEnvFlag('QUALIREPAR_V2', false),
};

export function isModuleEnabled(key: BuildFlagKey): boolean {
  return BUILD_FLAGS[key];
}
