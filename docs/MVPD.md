# MVP D — Architecture & runbook

Référence pour les développeurs et l'ops qui interviennent sur le périmètre
lead-gen + IA diagnostic + wallet crédits.

## Vue d'ensemble

```
[Consommateur]                                       [Réparateur]
     │                                                    │
     │  GET /diagnostic                                   │  GET /pro/onboarding (1ère fois)
     ▼                                                    ▼
┌──────────────────┐                              ┌──────────────────┐
│ DiagnosticPage   │                              │ OnboardingPage   │
│ formulaire 4 ch. │                              │ 4 étapes         │
└──────────────────┘                              └──────────────────┘
     │                                                    │
     │ POST diagnose-issue ──────► Claude Haiku           │ INSERT repairers
     │ ◄──────── JSON diag.+ id                           │ status='pending'
     │                                                    │
     │ (consent UI)                                       ▼
     │                                            ┌──────────────────┐
     │ POST submit-contact                        │ Admin            │
     │   - update issue_request                   │ /admin/mvpd-     │
     │   - server→server invoke                   │  repairers       │
     │     match-and-distribute                   │ status='active'  │
     │                                            │ + crédits offerts│
     │                                            └──────────────────┘
     ▼                                                    │
match-and-distribute                                      │
  for each candidat (max 3):                              │
    - debit_credits(1)  [RPC atomique]                    │
    - INSERT lead_deliveries                              │
    - invoke send-notification (email + SMS) ──────────► [Réparateur]
                                                          │
                                                          ▼
                                                     GET /pro/leads
                                                     GET /pro/leads/:id
                                                     POST lead-status-update
                                                     GET /pro/wallet
                                                       └─ POST stripe-checkout-credits
                                                       └─ webhook: credit_credits()
```

## Tables (migrations 20260518090000..20260518090700)

| Table | Rôle | RLS scope |
|---|---|---|
| `profiles` | Utilisateurs unifiés (consumer/repairer/admin) | self + admin |
| `repairers` | Étendue : `user_id`, `service_zones[]`, `credit_balance`, `status`, `qualirepar_certified`, `siret`, `bio`, `photo_url` | self + admin + public read |
| `issue_requests` | Demandes consommateur (insert anonyme OK) | self + admin |
| `lead_deliveries` | Leads distribués (unique par couple issue×repairer) | repairer (via `repairers.user_id`) + admin |
| `credit_transactions` | Historique wallet ; idempotent sur `stripe_session_id` | repairer (read) + admin |
| `seo_pages` | Pages SEO générées (Claude Sonnet) | public read (published) + admin |
| `seo_page_queue` | File de combinaisons à générer | admin only |

### RPCs

- `debit_credits(p_repairer, p_amount, p_lead) → integer | NULL`
  - `UPDATE … WHERE balance >= amount RETURNING …` ⇒ atomique, pas de SELECT FOR UPDATE
  - Retourne `NULL` si solde insuffisant (le caller doit gérer)
- `credit_credits(p_repairer, p_amount, p_session, p_kind) → integer`
  - Idempotent sur `stripe_session_id` (Stripe peut retry)
  - `p_kind` ∈ `{purchase, refund, grant}`

## Edge Functions

| Fonction | `verify_jwt` | Auth interne | Rôle |
|---|---|---|---|
| `diagnose-issue` | `false` | rate-limit IP 10/min | Claude Haiku → JSON → INSERT issue_request |
| `submit-contact` | `false` | rate-limit IP 5/min | Pont SPA → match-and-distribute (avec service-role) |
| `match-and-distribute` | `false` | **CRON_SECRET ou service-role uniquement** | Top 3 réparateurs, débit, INSERT lead_deliveries, notify |
| `lead-status-update` | `true` | JWT répareur (RLS) | UPDATE lead_deliveries (statut + valeur conversion) |
| `stripe-checkout-credits` | `true` | JWT réparateur | Crée session Checkout one-shot (49/129/379 €) |
| `stripe-webhooks` | `false` | signature Stripe | Branche `checkout.session.completed` → `credit_credits` |
| `generate-seo-page` | `false` | CRON_SECRET (`x-cron-secret`) | Claude Sonnet, 5 pages/sem depuis `seo_page_queue` |

**⚠️ Ne JAMAIS appeler `match-and-distribute` depuis le SPA directement.** Passer
par `submit-contact` qui détient le service-role côté Edge.

## Secrets requis (Supabase Edge)

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set CRON_SECRET=$(openssl rand -hex 32)
# Existants à confirmer : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
# RESEND_API_KEY, SMS_GATEWAY_URL/USERNAME/PASSWORD
```

## Vault Postgres (cron)

```sql
SELECT vault.create_secret('https://<ref>.functions.supabase.co/generate-seo-page', 'mvpd_seo_url');
SELECT vault.create_secret('<CRON_SECRET>', 'mvpd_cron_secret');
```

Le cron `mvpd-generate-seo` (lundi 04:00 UTC) lit ces secrets pour appeler
`generate-seo-page`.

## Déploiement complet

```bash
bash scripts/mvpd-deploy.sh
```

Le script :
1. Pose les 2 secrets Edge si absents
2. Provisionne le vault si absent
3. Push les 8 migrations
4. Déploie les 6 fonctions Edge (5 nouvelles + redeploy stripe-webhooks)
5. Régénère `src/integrations/supabase/types.ts`

## Actions manuelles post-déploiement

1. **Stripe Dashboard** → Webhooks → ajouter `checkout.session.completed` à
   l'endpoint `https://<ref>.functions.supabase.co/stripe-webhooks`
2. **`/admin/mvpd-repairers`** → activer manuellement les premiers réparateurs
   (passer `status` de `pending` à `active`, offrir 1-5 crédits via
   le bouton « +X crédits »)
3. **Optionnel** : remplacer `supabaseMvpd` par `supabase` dans les 5 pages
   MVP D (DiagnosticPage, LeadsListPage, LeadDetailPage, WalletPage,
   OnboardingPage, AdminMvpdRepairersPage) une fois `types.ts` régénéré.

## Coût d'exploitation (estimation)

| Item | Coût unitaire | Volume MVP (M+2) | Total mensuel |
|---|---|---|---|
| Claude Haiku diagnose-issue | ~0,001 €/req | 1000 req | 1 € |
| Claude Sonnet generate-seo-page | ~0,05 €/page | 20 pages | 1 € |
| Supabase Pro | 25 €/mois | — | 25 € |
| Brevo email (Resend en pratique) | 0,001 €/email | 3000 emails | 3 € |
| SMS Gateway | ~0,07 €/SMS | 300 SMS | 21 € |
| Stripe | 1,4 % + 0,25 € | 50 transactions | ~15 € |
| **Total** | | | **~65 €/mois** |

## Limitations connues (à traiter post-MVP)

- **Matching géo par code postal exact** uniquement (pas de PostGIS, donc pas
  les codes voisins). Upgrade : `ST_DWithin(repairer.geog, issue.geog, 30000)`
  une fois PostGIS activé.
- **`supabaseMvpd` `any` cast** : à supprimer après régénération de `types.ts`.
- **Pas de webhook de notification entrante** côté consommateur (l'app ne
  prévient pas le client quand un réparateur l'a contacté). À ajouter si
  rétention client devient un sujet.
- **Pas de Brevo** : conservé Resend + Android SMS Gateway par décision
  produit. Switch envisageable en V2.

## KPIs go/no-go (issus de la spec MVP D)

| KPI | Seuil M+2 | Seuil M+4 |
|---|---|---|
| Pros inscrits (`status='active'`) | 30 | 80 |
| Demandes consommateurs / semaine | 30 | 100 |
| Taux conversion lead → contacted | 60 % | 70 % |
| Taux achat crédits après 1er lead | 30 % | 50 % |
| ARPU pro mensuel | 50 € | 120 € |
| MRR équivalent | 1 500 € | 9 600 € |

Pour suivre : requêtes SQL d'aggregation sur `lead_deliveries.status` et
`credit_transactions.kind`.
