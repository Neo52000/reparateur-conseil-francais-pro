# TopReparateurs.fr

> Plateforme française de mise en relation entre particuliers et réparateurs de smartphones, tablettes et consoles.

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI](https://github.com/Neo52000/reparateur-conseil-francais-pro/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Neo52000/reparateur-conseil-francais-pro/actions/workflows/ci.yml)

Site en production : **https://topreparateurs.fr**

---

## À propos

TopReparateurs.fr met en relation des particuliers et des réparateurs qualifiés en France. La plateforme couvre la recherche géolocalisée, la demande de devis, la prise de rendez-vous, le paiement en ligne, et un back-office complet pour les réparateurs et l'administration.

## Fonctionnalités

### Pour les particuliers
- Recherche géolocalisée (carte Leaflet, filtres par services, marques, certification QualiRépar)
- Devis comparatifs et prise de RDV en ligne
- Suivi temps réel des demandes via Supabase Realtime
- Avis et notation des réparateurs

### Pour les réparateurs
- Profil professionnel (services, marques, certifications, photos)
- Gestion des devis et abonnement Stripe (mensuel ou annuel)
- Pages SEO programmatiques par ville et par appareil

### Administration
- Validation et modération des réparateurs
- Scraping ciblé (Google Places via Serper, géocodage Nominatim)
- Audit, analytics et rapports

## Stack

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend** : Supabase (Postgres + Auth + Realtime + Storage)
- **Edge Functions** : Deno (Supabase Functions) — auth, paiement, scraping, IA
- **Paiement** : Stripe (Subscriptions, webhooks signés HMAC, idempotence)
- **IA** : OpenAI / Gemini / Mistral (selon contexte) pour le diagnostic et la génération SEO
- **Email** : Resend
- **SMS** : Android SMS Gateway
- **Cartographie** : Leaflet + OpenStreetMap (Nominatim)
- **CDN / Hosting** : Netlify
- **Monitoring** : Sentry + plugin Lighthouse Netlify

## Arborescence

```
src/
├── components/          # Composants React (ui/, admin/, repairer/, customer/)
├── hooks/               # Hooks React personnalisés
├── pages/               # Pages (routes React Router)
├── services/            # Clients API
├── integrations/        # Intégration Supabase générée
├── types/               # Types TypeScript partagés
└── utils/               # Helpers

supabase/
├── functions/           # Edge Functions (Deno)
│   └── _shared/         # CORS allowlist, error handler, etc.
├── migrations/          # Migrations SQL
└── config.toml          # Configuration Supabase
```

## Installation locale

### Prérequis
- **Bun** ≥ 1.0 (lockfile actif : `bun.lock`)
- **Node.js** ≥ 18 (compatible npm en fallback)
- Un projet **Supabase** (clé `publishable` + URL)
- Stripe (compte test/live) si vous touchez aux flows paiement
- Optionnel : Mapbox token, Serper API key, Resend API key

### Étapes

```bash
# 1. Cloner
git clone https://github.com/Neo52000/reparateur-conseil-francais-pro.git
cd reparateur-conseil-francais-pro

# 2. Installer les dépendances
bun install

# 3. Configurer l'environnement
cp .env.example .env.local
# Renseigner les variables ci-dessous

# 4. Démarrer en dev
bun run dev
```

### Variables d'environnement (`.env.local`)

```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>

# Optionnel
VITE_MAPBOX_TOKEN=<token>
VITE_SENTRY_DSN=<dsn>
```

> ⚠️ La clé Supabase utilisée côté front est la **publishable key** (préfixe `pk_`),
> pas l'ancienne `anon key`. Le client `src/integrations/supabase/client.ts` lit
> `VITE_SUPABASE_PUBLISHABLE_KEY`.

Les secrets côté Edge Functions (Stripe, OpenAI, Gemini, Resend, SMS gateway, etc.)
se configurent via `supabase secrets set` ou le dashboard Supabase.

### Scripts

```bash
bun run dev          # Serveur de dev (Vite)
bun run build        # Build de production
bun run preview      # Prévisualisation du build
bun run typecheck    # tsc --noEmit
bun run lint         # ESLint
bun test             # Vitest
bun run e2e          # Playwright (smoke tests)
```

## Données

Tables principales : `profiles`, `repairers`, `repairer_profiles`, `quote_requests`,
`appointments`, `subscription_plans`, `payments`, `stripe_webhooks`, `scraping_logs`,
`notifications`, `repairer_reviews`.

Toutes les tables sensibles sont protégées par **Row Level Security (RLS)**.
Une refonte critique des policies a été appliquée en avril 2026 (cf. migration
`20260423120000_phase0_fix_rls_critical.sql`).

### Edge Functions notables

- `stripe-webhooks` — webhooks Stripe (signature HMAC + idempotence sur `stripe_event_id`)
- `create-payment-intent` / `create-subscription` — paiements
- `geocode-repairers` / `validate-scraping` / `scrape-repairers` — back-office scraping
- `generate-repairer-seo-page` — génération de pages SEO programmatiques
- `send-notification` — multi-canal (push, email Resend, SMS gateway)

CORS allowlist commune dans `supabase/functions/_shared/cors.ts`.

## Déploiement

Production sur **Netlify** (continuous deploy depuis `main`). Headers de sécurité
(HSTS, CSP, COOP, COEP, X-Frame-Options) configurés dans `netlify.toml`. Le plugin
`@netlify/plugin-lighthouse` audite chaque preview.

## Développement et contributions

- Branche par défaut : `main`
- Branche de session active : `claude/new-session-LvMm6`
- Hooks Husky : `pre-commit` (lint-staged) + `commit-msg`
- CI GitHub Actions : lint (non-bloquant pour l'instant), `tsc --noEmit`, build
- Workflow recommandé : fork → branche `feat/...` ou `fix/...` → PR (draft) → review → merge

Lecture utile avant contribution :
- [`AUDIT_20260507.md`](AUDIT_20260507.md) — état sécurité / qualité / dette
- [`DETTE_TECHNIQUE.md`](DETTE_TECHNIQUE.md) — backlog priorisé

## Licence

MIT — voir [`LICENSE`](LICENSE).
