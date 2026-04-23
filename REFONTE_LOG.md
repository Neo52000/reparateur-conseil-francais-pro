# REFONTE_LOG — TopRéparateurs.fr

Journal chronologique des opérations significatives de la refonte.
Une entrée = une commande / action destructive ou structurante.

---

## Phase 0 — Sécurité + nettoyage + suppression modules hors scope

### 2026-04-23 — Kick-off Phase 0

- Branche de travail : `claude/topreparateurs-nextjs-migration-2vrtj` (alignée sur consigne harness, override de `refonte-annuaire`)
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

---
