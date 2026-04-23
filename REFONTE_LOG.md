# REFONTE_LOG — TopRéparateurs.fr

Journal chronologique des opérations significatives de la refonte.
Une entrée = une commande / action destructive ou structurante.

---

## Phase 0 — Sécurité + nettoyage + suppression modules hors scope

> **Note sur la roadmap** : cette refonte **remplace** l'ancienne feuille de route
> (`ROADMAP_STRATEGIQUE.md`, dont la « Phase 1 » marquée terminée concernait le
> prototype Lovable). Le compteur de phases redémarre à 0 pour ce nouveau cycle.
> L'ancien fichier sera archivé en fin de Phase 0.

### 2026-04-23 — Kick-off Phase 0

- Branche de travail : `claude/topreparateurs-nextjs-migration-2vrtj`
- Working tree propre au démarrage, HEAD aligné sur `origin/claude/topreparateurs-nextjs-migration-2vrtj`
- Stack confirmée : React 18.3 + Vite + TS strict + Supabase + Sentry
- Inventaire initial :
  - `src/pages/` : 50+ pages
  - `src/components/` : 126 sous-dossiers
  - `src/hooks/` : 135 hooks
  - `supabase/migrations/` : **335 fichiers SQL** (accumulation Lovable)
  - `supabase/functions/` : 22 Edge Functions
- `.gitignore` correct (exclut `.env*` et lockfiles concurrents)
- `.env.example` sans secrets réels (placeholders uniquement)

### Reconnaissance lancée

- Agent 1 (Explore) : cartographie modules hors scope (devis, factures, stocks, NF525, SAV)
- Agent 2 (Explore) : audit sécurité (secrets, RLS, Edge Functions auth, deps vulnérables)

### Dette technique identifiée (à planifier)

- **Lint CI rouge avant Phase 0** : `bun run lint` → 1 471 erreurs + 292 warnings
  préexistantes (majoritairement `@typescript-eslint/no-explicit-any`). Root cause
  du `build` rouge sur PR #9, sans lien avec le commit d'init. Stratégie de
  remédiation à arbitrer avant la purge des modules hors scope.
- **Consolidation des 335 migrations Supabase** : squash à planifier en fin de
  Phase 0 ou début Phase 1, une fois les modules hors scope supprimés (pour
  éviter de squasher du code qui va disparaître).

---
