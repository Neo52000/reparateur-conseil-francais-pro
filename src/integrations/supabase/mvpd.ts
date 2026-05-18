/**
 * MVP D — accès aux tables non encore présentes dans le `types.ts`
 * auto-généré.
 *
 * Les tables `issue_requests`, `lead_deliveries`, `credit_transactions`,
 * `seo_pages` (+ colonnes ajoutées à `repairers` : `credit_balance`,
 * `service_zones`, etc.) sont créées par les migrations
 * `20260518090000..20260518090600`. Tant que `types.ts` n'est pas
 * regénéré (`mcp__f5d86529__generate_typescript_types` post-migration),
 * TypeScript ne les connaît pas et les builders Postgrest échouent.
 *
 * Ce wrapper expose un client typé `any` UNIQUEMENT pour ces tables.
 * À supprimer dès que `types.ts` est à jour — les pages basculeront
 * automatiquement sur le typage strict via `supabase` standard.
 */

import { supabase } from "./client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseMvpd = supabase as any;
