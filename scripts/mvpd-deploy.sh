#!/usr/bin/env bash
# ============================================================================
# MVP D — Script de déploiement (one-shot)
# ============================================================================
# À exécuter UNE FOIS depuis la racine du repo, après avoir :
#   1. supabase login
#   2. supabase link --project-ref <ref>
#   3. positionné les variables ANTHROPIC_API_KEY, CRON_SECRET en local
#      OU répondu aux prompts interactifs.
#
# Idempotent : ré-exécutable sans risque.
# ============================================================================

set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-nbugpbakfkyvvjzgfjmw}"
echo "→ Project ref: $PROJECT_REF"

# --- 1. Secrets Edge Functions --------------------------------------------
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  read -rsp "ANTHROPIC_API_KEY (sk-ant-...): " ANTHROPIC_API_KEY; echo
fi
if [[ -z "${CRON_SECRET:-}" ]]; then
  CRON_SECRET="$(openssl rand -hex 32)"
  echo "→ Generated CRON_SECRET: $CRON_SECRET"
fi

echo "→ Setting Supabase secrets…"
supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
supabase secrets set CRON_SECRET="$CRON_SECRET"

# --- 2. Vault pour le cron (URL + secret accessibles depuis Postgres) ------
SEO_URL="https://${PROJECT_REF}.functions.supabase.co/generate-seo-page"
echo "→ Provisioning vault secrets for cron (mvpd_seo_url + mvpd_cron_secret)…"
supabase db query "
  SELECT vault.create_secret('${SEO_URL}', 'mvpd_seo_url')
  WHERE NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'mvpd_seo_url'
  );
  SELECT vault.create_secret('${CRON_SECRET}', 'mvpd_cron_secret')
  WHERE NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'mvpd_cron_secret'
  );
"

# --- 3. Migrations ---------------------------------------------------------
echo "→ Applying migrations (push to remote)…"
supabase db push

# --- 4. Edge Functions -----------------------------------------------------
for fn in diagnose-issue match-and-distribute lead-status-update \
          stripe-checkout-credits generate-seo-page; do
  echo "→ Deploying function: $fn"
  supabase functions deploy "$fn"
done

echo "→ Redeploying stripe-webhooks (handler étendu MVP D)…"
supabase functions deploy stripe-webhooks

# --- 5. Régénération des types TypeScript ----------------------------------
echo "→ Regenerating src/integrations/supabase/types.ts…"
supabase gen types typescript --project-id "$PROJECT_REF" --schema public \
  > src/integrations/supabase/types.ts

echo
echo "✅ Déploiement MVP D terminé."
echo
echo "Actions manuelles restantes :"
echo "  1. Stripe Dashboard → Webhooks : ajouter l'event 'checkout.session.completed'"
echo "     à l'endpoint $PROJECT_REF.functions.supabase.co/stripe-webhooks"
echo "  2. Vérifier sur /admin/mvpd-repairers : activer manuellement les"
echo "     premiers réparateurs (status → 'active', offrir 1 crédit test)"
echo "  3. (Optionnel) Remplacer 'supabaseMvpd' par 'supabase' dans les 5 pages"
echo "     MVP D maintenant que types.ts est à jour"
echo "  4. Smoke test :"
echo "     - Soumettre /diagnostic (anonyme) → vérifier issue_requests"
echo "     - Acheter pack Découverte en test Stripe (4242...)"
echo "     - Trigger manuel du cron : curl -X POST -H 'x-cron-secret: \$CRON_SECRET' \\"
echo "       https://$PROJECT_REF.functions.supabase.co/generate-seo-page"
