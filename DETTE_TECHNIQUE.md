# DETTE_TECHNIQUE — TopRéparateurs.fr

Registre des dettes techniques connues, leur impact, leur priorité et
leur plan de résorption.

Dernière mise à jour : **2026-04-23** (fin Phase 0).

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
| _TBD_ | Fin Phase 1 | cible < 50 | cible < 100 |

---

## 2. Migrations Supabase non squashées (MOYENNE)

### Snapshot

- `supabase/migrations/` : **335 fichiers SQL** accumulés (prototype Lovable)
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

## 3. Audit sécurité — restes Phase 3 (MOYENNE)

Issues non critiques reportées à la refonte billing Phase 3 :

| Réf | Issue | Fichier | Phase |
|---|---|---|---|
| D3 | `create-subscription` sans JWT | `supabase/functions/_disabled/create-subscription` | Phase 3 |
| D4 | CORS wildcard sur endpoint paiement | `supabase/functions/_disabled/create-payment-intent` | Phase 3 |
| D6 | Stripe webhook sans `constructEvent()` | `supabase/functions/_disabled/stripe-webhooks` | Phase 3 |

Les 3 fonctions sont **en quarantaine** (répertoire `_disabled/`) et non
déployables en l'état. Cf. `supabase/functions/_disabled/README.md`.

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
