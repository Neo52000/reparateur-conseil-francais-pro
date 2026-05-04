# Checklist mise en production — TopRéparateurs.fr

État après les phases 1-4 du plan de remédiation. Tout ce qui est ✅ a été
livré sur la branche `feat/production-ready-cleanup`. Ce qui reste est listé
ci-dessous, classé par priorité.

## Phase 1 — Sécurité critique ✅ (sauf RLS live)

### ✅ Purge Lovable
- [x] 7 Edge Functions retirées du gateway `ai.gateway.lovable.dev`
- [x] Ordre fallback : Gemini → OpenAI → Mistral via `_shared/ai-text.ts`
- [x] AI selectors UI nettoyés (option `'lovable'` retirée)
- [x] LegalNotice + PrivacyPolicy : Lovable remplacé par Netlify
- [x] Dossier `.lovable/` supprimé

### ✅ Headers de sécurité Netlify
- [x] CSP, HSTS, X-Frame-Options, Permissions-Policy
- [x] Cache rules immutable sur `/assets`, `/*.js`, `/*.css`, `/lovable-uploads`
- [x] Cache 1h sur sitemap/robots/manifest

### ✅ CORS allowlist
- [x] `_shared/cors.ts` avec allowlist (`topreparateurs.fr` + dev)
- [x] Wildcard `*` retiré sur les 18 Edge Functions actives

### ✅ Stripe Edge Functions (sortie quarantaine)
- [x] `create-subscription` : auth JWT obligatoire, validation prix serveur
- [x] `create-payment-intent` : auth JWT, validation amount, autorisation client/admin
- [x] `stripe-webhooks` : `constructEventAsync()` avec `STRIPE_WEBHOOK_SECRET`
       + idempotence via `stripe_event_id` unique
- [ ] **Variables d'env Supabase Edge à renseigner avant déploiement** :
      - `STRIPE_SECRET_KEY` (`sk_test_...` ou `sk_live_...`)
      - `STRIPE_WEBHOOK_SECRET` (whsec_...)

### ❌ RLS migrations (en attente credentials)
- [ ] `supabase link --project-ref <REF>` puis `supabase db push`
- [ ] Migrations à appliquer :
      - `20260423120000_phase0_fix_rls_critical.sql` (D1/D2/D5)
      - `20260423120100_phase0_cleanup_drop_tables.sql`
- [ ] Vérifier après push : `supabase inspect db rls`

## Phase 2 — Structure & dette ✅
- [x] Imports morts AdminDashboard supprimés
- [x] Consolidation client Supabase (un seul `@/integrations/supabase/client`)
- [x] `src/components/payments/` (pluriel) supprimé
- [x] Purge Shopify (hook + nav + catégorie)
- [x] `vite.config.ts` : `esbuild.drop ['console','debugger']` en prod
- [x] ESLint `no-unused-vars: warn`
- [x] 9 TODOs flottants ré-étiquetés par phase

## Phase 3 — SEO & GEO ✅
- [x] Conflit routes résolu : `/:city/:repairerName` → `/seo/:city/:repairerName`
- [x] Duplicate blog `/blog/article/:slug` supprimé + redirect 301 Netlify
- [x] BreadcrumbList JSON-LD (`BreadcrumbSchema.tsx`)
- [x] Article JSON-LD sur BlogArticlePage
- [x] Sitemap build-time (`scripts/generate-sitemap.ts` + hook prebuild)
- [x] hreflang fr-FR + x-default sur 4 layouts
- [x] robots.txt élargi
- [x] Web Vitals → Sentry

## Phase 4 — UI/UX ✅
- [x] Fonts Inter + Plus Jakarta Sans self-hosted via @fontsource (RGPD)
- [x] `next-themes` désinstallé (V2)
- [x] `@radix-ui/react-toast` désinstallé, Sonner only
- [x] Toaster monté dans App (était jamais rendu !)
- [x] Skip-link a11y (existant)
- [x] BlogArticlePage layout magazine (TOC sticky + share buttons)
- [x] BlogPage hero featured + filtres pills
- [x] Fiche réparateur sticky CTA mobile (Appel + RDV/Devis)
- [x] RepairersList virtualisation (`@tanstack/react-virtual`)

### Bundle splitting ✅
- [x] AdminPage : 51 imports eager → lazy chunks par tab
- [x] AdminPage main chunk : **2724 KB → 646 KB** (-76%)
- [x] Pages publiques ne chargent plus aucun chunk admin

## Phase 5 — Stripe abonnements (à venir)
**Pré-requis** : Phase 1.4 effectuée ✓ (Edge Functions corrigées)

- [ ] Variables d'env Supabase Edge :
      - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `stripe trigger payment_intent.succeeded` → vérifier table `payments`
- [ ] Frontend : `SubscriptionPlans.tsx` branché sur `create-subscription`
- [ ] Webhook URL configuré côté Stripe : `https://<project>.supabase.co/functions/v1/stripe-webhooks`
- [ ] Mode test → live : flip variables d'env

## Pré-déploiement final

### Variables d'environnement Netlify (PROD)
```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_MAPBOX_PUBLIC_TOKEN=pk.eyJ... (optionnel)
PUBLIC_SITE_URL=https://topreparateurs.fr
```

### Variables Supabase Edge Functions secrets
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...           # Provider IA principal
OPENAI_API_KEY=...           # Fallback (optionnel)
MISTRAL_API_KEY=...          # Fallback (optionnel)
SERPER_API_KEY=...           # Google Places scraping
RESEND_API_KEY=...           # Email transactionnel
STRIPE_SECRET_KEY=...        # Phase 5
STRIPE_WEBHOOK_SECRET=...    # Phase 5
ALLOWED_ORIGINS=https://topreparateurs.fr,https://www.topreparateurs.fr
```

### Vérifications avant DNS flip
- [ ] `npm run build` succès
- [ ] `npm run sitemap` génère les XML attendus
- [ ] `curl -I https://<preview>.netlify.app` → headers CSP/HSTS présents
- [ ] Lighthouse mobile ≥ 85 sur Home, SearchPage, fiche réparateur
- [ ] Sentry capture une erreur volontaire en preview
- [ ] Test golden path :
      - Recherche "iPhone Lyon" → résultats + carte
      - Click fiche réparateur → SEO meta corrects (View Source)
      - Génération article blog admin → publication
      - Devis client → email Resend reçu
      - (Phase 5) Paiement test Stripe → webhook traité, `payments` à jour
- [ ] Outils SEO :
      - Google Search Console : sitemap soumis
      - Vérification rich results : BreadcrumbList + Article + LocalBusiness
- [ ] RGPD : politique cookies active, bandeau de consentement, mentions
       légales à jour, hébergeurs corrects (Netlify + Supabase)

### Monitoring post-déploiement
- [ ] Sentry releases configurées (`sentry-cli releases new`)
- [ ] Netlify deploy notifications (Slack/email)
- [ ] Better Uptime ou UptimeRobot sur home + 3 routes critiques
