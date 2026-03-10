

# Blog Booster Social — Plan d'implémentation

## 1. Audit du dépôt

**Stack détectée :**
- Frontend : React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend : Supabase (PostgreSQL + Edge Functions Deno + Auth + Storage)
- IA : Fallback chain Lovable AI → OpenAI → Gemini → Mistral (clés configurées)
- Blog : Tables `blog_posts`, `blog_categories`, `blog_social_shares` existantes, Edge Functions pour génération IA
- Matching réparateurs : `AIRepairerMatcher` avec scoring multi-critères dans `src/services/search/`
- Admin : Sidebar avec tabs, pattern `?tab=xxx` dans `/admin`
- Contrainte critique : **Supabase free tier** — 20 Edge Functions actuellement déployées, limite historique atteinte à ~25

**Points d'intégration clés :**
- Le blog et l'IA existent déjà — on réutilise les patterns de `blog-ai-generator` et le fallback IA
- Le matching réparateurs existe — on réutilise `AIRepairerMatcher` adapté
- L'admin sidebar existe — on ajoute un tab `social-booster`
- `blog_social_shares` existe déjà pour tracker les partages

**Risque principal :** Le free tier Supabase limite le nombre d'Edge Functions. On doit consolider en **une seule Edge Function** `social-booster` avec routage par `action`.

---

## 2. Architecture cible

```text
┌─────────────────────────────────────────────────┐
│                  Admin UI                        │
│  /admin?tab=social-booster                       │
│  ┌──────────┬────────────┬──────────┬──────────┐ │
│  │ Articles │ Campagnes  │ Posts    │ Logs     │ │
│  │ détectés │ générées   │ générés  │ & Stats  │ │
│  └──────────┴────────────┴──────────┴──────────┘ │
└───────────────────────┬─────────────────────────┘
                        │ supabase.functions.invoke
                        ▼
┌─────────────────────────────────────────────────┐
│        Edge Function: social-booster             │
│  action: scan | generate | publish | status      │
│  ┌─────────────┐  ┌──────────────┐              │
│  │ Article     │  │ AI Content   │              │
│  │ Ingestion   │  │ Generator    │              │
│  └──────┬──────┘  └──────┬───────┘              │
│         │                │                       │
│  ┌──────▼──────┐  ┌──────▼───────┐              │
│  │ Repairer    │  │ Publishers   │              │
│  │ Matcher     │  │ FB/IG/X/LI   │              │
│  └─────────────┘  └──────────────┘              │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│              Supabase Tables                     │
│  social_campaigns | social_posts                 │
│  social_publication_logs | social_settings       │
└─────────────────────────────────────────────────┘
```

---

## 3. Plan d'implémentation — MVP

### 3a. Base de données (1 migration)

**Tables à créer :**

- `social_campaigns` : lie un article blog à une campagne sociale
  - id, blog_post_id (FK blog_posts), status (enum), repairer_id (nullable), match_score, match_reason, created_at, updated_at

- `social_posts` : chaque post généré par réseau
  - id, campaign_id (FK), platform (facebook|instagram|x|linkedin), content, hashtags, cta_text, cta_url, media_url, status (draft|approved|scheduled|publishing|published|failed|cancelled), external_post_id, scheduled_at, published_at, error_message, created_at, updated_at

- `social_publication_logs` : journal d'événements
  - id, social_post_id (FK), action, status, response_data (jsonb), error_message, created_at

- `social_settings` : configuration globale (1 row, jsonb)
  - id, config (jsonb: auto_scan, default_platforms, utm_source, utm_medium, etc.), updated_at

### 3b. Edge Function unique : `social-booster`

Routage par `action` param :
- `scan` : Lit `blog_posts` publiés sans campagne associée → insère dans `social_campaigns` avec status `detected`
- `generate` : Pour une campagne donnée, appelle l'IA (même fallback chain) pour générer 4 posts adaptés par réseau + match réparateur
- `publish` : Publie un `social_post` sur le réseau cible (MVP = copie dans le presse-papier + lien direct, car pas de credentials Meta/LinkedIn/X configurés)
- `status` : Retourne les stats des campagnes

### 3c. Services frontend (src/services/social/)

- `socialBoosterService.ts` : Appels à l'Edge Function
- `socialRepairerMatcher.ts` : Logique de matching adaptée du `AIRepairerMatcher` existant (par catégorie, spécialité, ville de l'article)

### 3d. Interface admin

- `src/components/admin/social-booster/SocialBoosterDashboard.tsx` : Composant principal avec 4 sous-tabs
- `ArticlesDetectedList.tsx` : Liste des articles non encore traités, bouton "Générer campagne"
- `CampaignsList.tsx` : Campagnes avec statut, réparateur associé, raison du match
- `PostEditor.tsx` : Edition du contenu généré par réseau, preview, boutons approuver/publier
- `SocialBoosterLogs.tsx` : Journal des publications
- Ajout du tab `social-booster` dans `AdminSidebar.tsx`

### 3e. Prompts IA

Un prompt par réseau, intégrés dans l'Edge Function :
- Facebook : 200-300 mots, ton éducatif, CTA vers article + recherche réparateur
- Instagram : 150 mots max, hashtags, ton engageant
- X : 280 caractères max, lien + emoji
- LinkedIn : 200-400 mots, ton expertise/autorité

Chaque prompt inclut dynamiquement : titre article, excerpt, URL avec UTM, nom réparateur si match, CTA adapté.

### 3f. Fichiers à créer/modifier

**Créer :**
- `supabase/migrations/xxx_social_booster_tables.sql`
- `supabase/functions/social-booster/index.ts`
- `src/services/social/socialBoosterService.ts`
- `src/services/social/socialRepairerMatcher.ts`
- `src/components/admin/social-booster/SocialBoosterDashboard.tsx`
- `src/components/admin/social-booster/ArticlesDetectedList.tsx`
- `src/components/admin/social-booster/CampaignsList.tsx`
- `src/components/admin/social-booster/PostEditor.tsx`
- `src/components/admin/social-booster/SocialBoosterLogs.tsx`
- `src/types/socialBooster.ts`

**Modifier :**
- `src/components/admin/AdminSidebar.tsx` : Ajout tab social-booster
- `src/pages/AdminPage.tsx` (ou équivalent) : Ajout rendu du composant
- `supabase/config.toml` : Ajout `[functions.social-booster]`

### 3g. Variables d'environnement

MVP : Aucune nouvelle variable requise. L'IA utilise les clés existantes (LOVABLE_API_KEY, etc.).

V2 (quand credentials sociaux disponibles) :
- META_ACCESS_TOKEN, META_PAGE_ID, META_IG_ACCOUNT_ID
- LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORGANIZATION_ID
- X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET

### 3h. Ce que fait le MVP vs la V2

| Fonctionnalité | MVP | V2 |
|---|---|---|
| Scan articles non traités | Oui | Auto-cron |
| Génération 4 posts IA | Oui | Variantes A/B |
| Matching réparateur | Oui | Rotation intelligente |
| Edition manuelle | Oui | Templates |
| Publication manuelle assistée | Oui (copier + lien) | API directe |
| Logs | Oui | Analytics clics |
| Anti-doublons | Oui | Republication différée |

---

## 4. Limites connues

- La publication MVP est "assistée" (copier-coller + lien direct vers chaque réseau) car aucun credential Meta/LinkedIn/X n'est configuré
- Le scan est déclenché manuellement (pas de cron auto en MVP)
- Pas de génération d'images spécifiques pour les réseaux sociaux (réutilise l'image de l'article)
- Free tier Supabase : 1 seule Edge Function ajoutée (total ~21)

