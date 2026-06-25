# DETTE_TECHNIQUE — TopRéparateurs.fr

Registre des dettes techniques connues, leur impact, leur priorité et
leur plan de résorption.

Dernière mise à jour : **2026-05-09** (fin sprint S+1).

---

## 1. Lint legacy (HAUTE — en cours de résorption contrôlée)

### Snapshot initial — 2026-04-23

- `bun run lint` → **1 471 erreurs + 292 warnings** (ESLint flat config)
- Majorité : `@typescript-eslint/no-explicit-any` sur code hérité des ~2 100
  micro-commits Lovable
- 1 `@typescript-eslint/no-require-imports` dans `tailwind.config.ts`
- Origine : prototype Lovable.dev, generation IA sans typage strict

### Stratégie de résorption

| Étape | Quand | Action |
|---|---|---|
| Gel des régressions | **Phase 0 (fait)** | Husky + lint-staged : pre-commit hook qui lint uniquement les fichiers `staged`. Toute nouvelle ligne commitée **doit** passer ESLint |
| CI | **Phase 0 (fait)** | `lint` en `continue-on-error: true`. Le job `build` reste bloquant |
| Résorption progressive | Phase 1 (migration Next.js) | La majorité des fichiers sera réécrite ou déplacée ; fixer les `any` au passage |
| Purge finale | Fin Phase 1 | Remettre `continue-on-error: false` une fois le compteur < 50 erreurs |

### Mesure objective

Compteur à snapshooter à chaque fin de phase :
```bash
bun run lint 2>&1 | grep -oP '\d+ problems \(\K\d+' | head -1
```

| Date | Phase | Erreurs | Warnings |
|---|---|---|---|
| 2026-04-23 | Début Phase 0 | 1 471 | 292 |
| 2026-05-07 | Début sprint S+1 | 1 065 | 1 223 |
| 2026-05-09 | Fin sprint S+1 (PRs #29, #30, #31, #32, #33, #34, #35) | 946 | 1 223 |
| _TBD_ | Fin Phase 1 | cible < 50 | cible < 100 |

---

## 2. Migrations Supabase non squashées (MOYENNE)

### Snapshot

- `supabase/migrations/` : **337 fichiers SQL** accumulés (prototype Lovable)
- Volume rend `supabase db reset` lent et `db diff` bruité

### Plan de résorption

| Étape | Quand | Action |
|---|---|---|
| Fix RLS critique | **Phase 0 (fait)** | `20260423120000_phase0_fix_rls_critical.sql` (D1/D2/D5) |
| DROP tables hors scope | **Phase 0 (fait)** | `20260423120100_phase0_cleanup_drop_tables.sql` |
| Squash baseline | **À exécuter manuellement** (nécessite DB live) | Cf. procédure ci-dessous |

### Procédure de squash (à exécuter par un humain)

```bash
# 1. Backup complet AVANT squash (obligatoire)
supabase db dump --data-only      > pre_squash_data_2026-04-23.sql
supabase db dump --schema public  > pre_squash_backup_2026-04-23.sql

# 2. Générer la baseline à partir de l'état courant (après phase 0)
supabase db dump --schema public  > supabase/migrations/20260423_phase0_squash_baseline.sql

# 3. Archiver les migrations historiques
mkdir -p supabase/migrations/_archive
git mv supabase/migrations/2025*.sql supabase/migrations/_archive/
git mv supabase/migrations/20260423120000_phase0_fix_rls_critical.sql \
      supabase/migrations/_archive/
git mv supabase/migrations/20260423120100_phase0_cleanup_drop_tables.sql \
      supabase/migrations/_archive/

# 4. Marquer les anciennes migrations comme appliquées
#    (éviter qu'elles soient rejouées en cas de db reset)
psql "$SUPABASE_DB_URL" <<'SQL'
INSERT INTO supabase_migrations.schema_migrations (version, name)
SELECT replace(replace(f, '.sql', ''), '-', '_'), f
FROM unnest(ARRAY[
  -- liste des 335 fichiers historiques, à générer automatiquement :
  -- ls supabase/migrations/_archive/ | sort
]) AS f
ON CONFLICT DO NOTHING;
SQL

# 5. Vérifier
supabase db reset                   # doit prendre < 30 s
supabase db diff --schema public    # doit être vide
```

---

## 3. Audit sécurité — Stripe (résolu en Phase 0+, à vérifier en Phase 3)

> ⚠️ **Note 2026-05-07** : la version précédente de cette section disait que
> `create-subscription`, `create-payment-intent` et `stripe-webhooks` étaient
> en quarantaine dans `supabase/functions/_disabled/`. **Ce n'est plus le
> cas.** Les trois fonctions sont actives dans `supabase/functions/` et
> déployées en prod. Le répertoire `_disabled/` n'existe plus. Cf.
> `AUDIT_20260507.md` § 2 (delta positif vs mars).

État actuel des trois fonctions :

| Réf | Issue d'origine | Statut 2026-05-07 |
|---|---|---|
| D3 | `create-subscription` sans JWT | Actif. `verify_jwt = true` (default Supabase) **et** la fonction vérifie explicitement le JWT en appelant `supabaseAdmin.auth.getUser(token)` (cf. `supabase/functions/create-subscription/index.ts:34`) avant toute opération. |
| D4 | CORS wildcard sur endpoint paiement | Migré vers `_shared/cors.ts` allowlist (PR #21). |
| D6 | Stripe webhook sans `constructEvent()` | Implémente `stripe.webhooks.constructEventAsync()` + idempotence via `stripe_event_id` unique sur la table `stripe_webhooks`. |

Restes Phase 3 (à valider quand le flow checkout passe en prod réel) :
- Test e2e : 1 paiement test live de bout en bout
- Couverture Vitest sur la fonction `stripe-webhooks` (mocks Stripe SDK ou
  test Deno) — voir backlog PR-6.

---

## 4. Dépendances browserslist périmées (FAIBLE)

Warning build Vite :
```
Browserslist: browsers data (caniuse-lite) is 18 months old
```

Fix 1-ligne à appliquer au passage :
```bash
bun add -D caniuse-lite@latest
```
Non-bloquant, pas de CVE. À faire Phase 1.

---

## 5. Sprint S+1 — Acquis (2026-05-07 → 2026-05-09)

Sprint déclenché par `AUDIT_20260507.md`. **14 PRs mergées** sur la branche
`claude/new-session-LvMm6` :

| PR | Sujet | Audit ref |
|---|---|---|
| #21 | CORS allowlist sur 10 Edge Functions + `_shared/cors.ts` | P0 #5 |
| #22 | README rewrite (alignement `topreparateurs.fr`) | P1 #8 |
| #23 | Build-time feature flags (`buildFlags.ts` + `<FeatureGate>`) | P1 #7 |
| #25 | 78 nouveaux tests Vitest (validation, sitemap, cn) | P0 #6 (partiel) |
| #26 | TypeScript strict ratchet (`tsconfig.strict.json` + CI step) | P0 #3 |
| #27 | DETTE_TECHNIQUE refresh (Stripe quarantine désactualisée) | P1 #9 |
| #28 | Auth + rate-limit sur 7 Edge Functions sensibles | P0 #2, #4 |
| #29 | ESLint burndown v1 (1065 → 1036) + lint-staged relaxé | P1 #9 |
| #30 | Élimination des 13 `no-case-declarations` | P1 #9 |
| #31 | -9 `no-explicit-any` dans `src/utils/` | P1 #9 |
| #32 | -7 `no-explicit-any` dans `src/services/` (paginate, repository) | P1 #9 |
| #33 | -11 `no-explicit-any` dans `src/hooks/` (useRealRepairers, useAnalyticsEvents) | P1 #9 |
| #34 | -23 `no-explicit-any` dans 3 hooks UI (useUIConfigurations, useProfileTemplates, useDragDropAdvanced) | P1 #9 |
| #35 | -27 `no-explicit-any` dans la chaîne admin-audit + `JsonObject` standardisé | P1 #9 |

Score audit estimé : **6/10 → ~8/10** (P0 #1 et P1 #10/#12 restent).

### Restants déférés

| Item | Raison du report |
|---|---|
| **P0 #1** Purge `.env` git history + rotation Supabase/Mapbox | Bloqué : rotation manuelle dashboards (utilisateur), puis force-push destructif |
| **P1 #10** Squash 337 migrations | Bloqué : backup DB prod obligatoire |
| **P1 #12** CSP nonce-based | Multi-jours, risque casser Stripe Elements / Sentry |
