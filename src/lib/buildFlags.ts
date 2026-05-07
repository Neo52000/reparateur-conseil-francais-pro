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

// Vite only inlines literal `import.meta.env.VITE_*` accesses at build time.
// Dynamic access (`import.meta.env[someKey]`) loses constant folding and
// breaks DCE in production — keep these references static.
function parseFlag(value: unknown, fallback: boolean): boolean {
  if (typeof value !== 'string' || value === '') return fallback;
  return value === 'true' || value === '1';
}

const isDev: boolean = Boolean(import.meta.env.DEV);

export const BUILD_FLAGS: Record<BuildFlagKey, boolean> = {
  AI_CMO: parseFlag(import.meta.env.VITE_FEATURE_AI_CMO, isDev),
  BLOG_AUTO: parseFlag(import.meta.env.VITE_FEATURE_BLOG_AUTO, isDev),
  SOCIAL_BOOSTER: parseFlag(import.meta.env.VITE_FEATURE_SOCIAL_BOOSTER, isDev),
  LANDING_BUILDER: parseFlag(import.meta.env.VITE_FEATURE_LANDING_BUILDER, isDev),
  GAMIFICATION: parseFlag(import.meta.env.VITE_FEATURE_GAMIFICATION, isDev),
  QUALIREPAR_V1: parseFlag(import.meta.env.VITE_FEATURE_QUALIREPAR_V1, false),
  QUALIREPAR_V2: parseFlag(import.meta.env.VITE_FEATURE_QUALIREPAR_V2, false),
};

export function isModuleEnabled(key: BuildFlagKey): boolean {
  return BUILD_FLAGS[key];
}
