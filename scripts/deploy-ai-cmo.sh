#!/usr/bin/env bash
# =====================================================
# AI-CMO Module Deployment Script
# =====================================================
# Deploie le module AI-CMO dans votre projet Supabase :
# 1. Applique la migration SQL (7 tables + RLS)
# 2. Configure les secrets LLM (OpenAI, Gemini, Perplexity)
# 3. Deploie l'Edge Function ai-cmo-worker
# 4. Affiche le SQL pour le cron job (a executer manuellement)
#
# Prerequis :
# - Supabase CLI installe (https://supabase.com/docs/guides/cli)
# - Etre logge : supabase login
# - Projet lie : supabase link --project-ref <ref>
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  AI-CMO Module Deployment${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# ----- Etape 0 : Verifier les prerequis -----
echo -e "${YELLOW}[0/4] Verification des prerequis...${NC}"

if ! command -v supabase &> /dev/null; then
  echo -e "${RED}[ERREUR] Supabase CLI n'est pas installe.${NC}"
  echo ""
  echo "Installation :"
  echo "  macOS    : brew install supabase/tap/supabase"
  echo "  Linux    : curl -fsSL https://supabase.com/install.sh | sh"
  echo "  Windows  : scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase"
  echo ""
  exit 1
fi

if ! supabase projects list &> /dev/null; then
  echo -e "${RED}[ERREUR] Vous n'etes pas logge.${NC}"
  echo "Executez : supabase login"
  exit 1
fi

if [ ! -f "$PROJECT_ROOT/supabase/config.toml" ]; then
  echo -e "${RED}[ERREUR] Ce script doit etre lance depuis un projet Supabase.${NC}"
  exit 1
fi

PROJECT_REF=$(grep -E "^project_id" "$PROJECT_ROOT/supabase/config.toml" | cut -d'"' -f2)
if [ -z "$PROJECT_REF" ]; then
  echo -e "${RED}[ERREUR] project_id manquant dans supabase/config.toml${NC}"
  exit 1
fi

echo -e "${GREEN}[OK] Supabase CLI pret - projet : $PROJECT_REF${NC}"
echo ""

# ----- Etape 1 : Migration SQL -----
echo -e "${YELLOW}[1/4] Application de la migration SQL...${NC}"
echo "La migration va creer 7 tables AI-CMO avec RLS et indexes."
read -p "Appliquer la migration 'supabase db push' ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[OoYy]$ ]]; then
  (cd "$PROJECT_ROOT" && supabase db push)
  echo -e "${GREEN}[OK] Migration appliquee${NC}"
else
  echo -e "${YELLOW}[SKIP] Migration ignoree - pensez a l'appliquer manuellement${NC}"
fi
echo ""

# ----- Etape 2 : Secrets LLM -----
echo -e "${YELLOW}[2/4] Configuration des cles API LLM...${NC}"
echo "Au moins UNE cle est requise. Laissez vide pour ignorer."
echo ""

read -p "OPENAI_API_KEY (ChatGPT) : " OPENAI_KEY
if [ -n "$OPENAI_KEY" ]; then
  (cd "$PROJECT_ROOT" && supabase secrets set "OPENAI_API_KEY=$OPENAI_KEY")
  echo -e "${GREEN}[OK] OPENAI_API_KEY configure${NC}"
fi

read -p "GEMINI_API_KEY (Google) : " GEMINI_KEY
if [ -n "$GEMINI_KEY" ]; then
  (cd "$PROJECT_ROOT" && supabase secrets set "GEMINI_API_KEY=$GEMINI_KEY")
  echo -e "${GREEN}[OK] GEMINI_API_KEY configure${NC}"
fi

read -p "PERPLEXITY_API_KEY : " PERPLEXITY_KEY
if [ -n "$PERPLEXITY_KEY" ]; then
  (cd "$PROJECT_ROOT" && supabase secrets set "PERPLEXITY_API_KEY=$PERPLEXITY_KEY")
  echo -e "${GREEN}[OK] PERPLEXITY_API_KEY configure${NC}"
fi

if [ -z "$OPENAI_KEY" ] && [ -z "$GEMINI_KEY" ] && [ -z "$PERPLEXITY_KEY" ]; then
  echo -e "${RED}[WARNING] Aucune cle API configuree - le worker ne pourra pas executer les prompts${NC}"
fi
echo ""

# ----- Etape 3 : Deploy Edge Function -----
echo -e "${YELLOW}[3/4] Deploiement de l'Edge Function ai-cmo-worker...${NC}"
read -p "Deployer la function ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[OoYy]$ ]]; then
  (cd "$PROJECT_ROOT" && supabase functions deploy ai-cmo-worker)
  echo -e "${GREEN}[OK] Edge Function deployee${NC}"
  echo "URL : https://$PROJECT_REF.supabase.co/functions/v1/ai-cmo-worker"
else
  echo -e "${YELLOW}[SKIP] Deploy ignore${NC}"
fi
echo ""

# ----- Etape 4 : Cron Job (manuel) -----
echo -e "${YELLOW}[4/4] Configuration du cron job (manuel)...${NC}"
echo "Le cron necessite votre service_role key qui ne doit pas etre automatisee."
echo ""
echo "Pour activer l'execution automatique toutes les heures :"
echo ""
echo -e "${BLUE}1.${NC} Copiez votre service_role key depuis :"
echo "   https://app.supabase.com/project/$PROJECT_REF/settings/api"
echo ""
echo -e "${BLUE}2.${NC} Ouvrez le SQL Editor :"
echo "   https://app.supabase.com/project/$PROJECT_REF/sql/new"
echo ""
echo -e "${BLUE}3.${NC} Copiez-collez le contenu de :"
echo "   supabase/manual-migrations/setup_ai_cmo_cron_job.sql"
echo ""
echo -e "${BLUE}4.${NC} Remplacez 'YOUR_SERVICE_ROLE_KEY_HERE' par votre cle et executez"
echo ""

# ----- Resume -----
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  Deploiement termine !${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo "Prochaines etapes :"
echo "  1. Ouvrez /admin?tab=ai-cmo dans votre application"
echo "  2. Remplissez Profil, Concurrents, Questions"
echo "  3. Cliquez sur 'Lancer les questions dues' pour un test"
echo ""
echo "Voir AI_CMO_DEPLOYMENT.md pour le guide complet."
