# Guide de deploiement AI-CMO

Ce guide vous accompagne pas-a-pas pour activer le module AI-CMO dans votre projet.

**Duree totale** : 15-20 minutes (hors creation des comptes API)

---

## Pre-requis

- Acces au Supabase Dashboard de votre projet
- Terminal avec Node.js 18+ installe
- Au moins une cle API parmi : OpenAI, Google Gemini, ou Perplexity

---

## Etape 1 — Installer la Supabase CLI

### macOS (Homebrew)
```bash
brew install supabase/tap/supabase
```

### Linux
```bash
curl -fsSL https://supabase.com/install.sh | sh
```

### Windows (Scoop)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Verification
```bash
supabase --version
# Devrait afficher : 1.x.x ou superieur
```

---

## Etape 2 — Se connecter et lier le projet

```bash
# Login via navigateur
supabase login

# Aller dans le dossier du projet
cd /chemin/vers/reparateur-conseil-francais-pro

# Lier le projet (project_id est deja dans supabase/config.toml)
supabase link --project-ref nbugpbakfkyvvjzgfjmw
```

Vous serez invite a saisir le **Database password** (trouvez-le dans Dashboard > Settings > Database > Connection String, clic sur "Reveal").

---

## Etape 3 — Applying the migration (creation des 7 tables)

### Option A : Via la CLI (recommande)
```bash
supabase db push
```

Si la commande echoue avec un conflit, utilisez l'option B.

### Option B : Manuellement via le SQL Editor

1. Ouvrez : https://app.supabase.com/project/nbugpbakfkyvvjzgfjmw/sql/new
2. Copiez tout le contenu du fichier :
   ```
   supabase/migrations/20260416120000_ai_cmo_tables.sql
   ```
3. Collez et cliquez sur **Run**

### Verification
Dans Dashboard > Table Editor, vous devez voir 7 nouvelles tables :
- `ai_cmo_profiles`
- `ai_cmo_competitors`
- `ai_cmo_questions`
- `ai_cmo_prompt_runs`
- `ai_cmo_dashboard_stats`
- `ai_cmo_recommendations`
- `ai_cmo_llm_costs`

---

## Etape 4 — Obtenir les cles API LLM

Vous devez configurer **au moins une** de ces 3 cles. Plus vous en avez, plus votre monitoring sera representatif.

### OpenAI (ChatGPT) — Recommande
1. Allez sur https://platform.openai.com/api-keys
2. Cliquez sur **Create new secret key**
3. Copiez la cle (commence par `sk-...`)
4. Coût estime : ~0.01$ par question analysee (gpt-4o-mini)

### Google Gemini — Recommande (gratuit)
1. Allez sur https://aistudio.google.com/app/apikey
2. Cliquez sur **Create API key**
3. Copiez la cle (commence par `AIza...`)
4. Coût estime : gratuit dans les limites (60 req/min)

### Perplexity — Optionnel (temps reel)
1. Allez sur https://www.perplexity.ai/settings/api
2. Cliquez sur **Generate API Key**
3. Copiez la cle (commence par `pplx-...`)
4. Coût estime : ~0.02$ par question (sonar)

---

## Etape 5 — Configurer les secrets Supabase

### Via la CLI (recommande)
```bash
supabase secrets set OPENAI_API_KEY="sk-..."
supabase secrets set GEMINI_API_KEY="AIza..."
supabase secrets set PERPLEXITY_API_KEY="pplx-..."  # optionnel
```

### Via le Dashboard
1. Allez sur https://app.supabase.com/project/nbugpbakfkyvvjzgfjmw/settings/functions
2. Dans la section **Edge Function Secrets**, cliquez sur **Add new secret**
3. Ajoutez chaque cle une par une

### Verification
```bash
supabase secrets list
```

---

## Etape 6 — Deployer l'Edge Function

```bash
supabase functions deploy ai-cmo-worker
```

### Verification
Cela doit afficher :
```
Deployed Function ai-cmo-worker on project nbugpbakfkyvvjzgfjmw
```

URL de la fonction :
```
https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/ai-cmo-worker
```

---

## Etape 7 — Configurer le cron job (execution automatique)

### 7.1 Recuperer votre service_role key

1. Allez sur https://app.supabase.com/project/nbugpbakfkyvvjzgfjmw/settings/api
2. Section **Project API keys**
3. Cliquez sur **Reveal** pour `service_role` (secret)
4. Copiez la cle (commence par `eyJ...`) — **a garder secret**

### 7.2 Executer le SQL cron

1. Allez sur https://app.supabase.com/project/nbugpbakfkyvvjzgfjmw/sql/new
2. Copiez le contenu de `supabase/manual-migrations/setup_ai_cmo_cron_job.sql`
3. Remplacez `YOUR_SERVICE_ROLE_KEY_HERE` par votre vraie cle (etape 7.1)
4. Cliquez sur **Run**

Le cron s'execute **toutes les heures** (`0 * * * *`). Chaque question a sa propre frequence (configuree dans l'admin) — le worker ne traite que celles qui sont dues.

### 7.3 Verification

```sql
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'ai-cmo-worker';
```

Doit afficher :
```
jobname: ai-cmo-worker
schedule: 0 * * * *
active: true
```

---

## Etape 8 — Premier test

### 8.1 Configurer le profil

1. Dans votre admin, allez sur `/admin?tab=ai-cmo`
2. Onglet **Profil** : remplissez au minimum :
   - Description de l'entreprise
   - Site web (ex: `https://topreparateurs.fr`)
   - Alias de nom (ex: `TopReparateurs, Top Reparateurs, topreparateurs.fr`)
3. Cliquez sur **Sauvegarder**

### 8.2 Ajouter des concurrents

1. Onglet **Concurrents**
2. Ajoutez 3-5 concurrents (nom + site web + poids)
3. Cliquez sur **Sauvegarder**

### 8.3 Creer des questions

1. Onglet **Questions**
2. Cliquez sur **Ajouter** et creez des prompts type :
   - "Quels sont les meilleurs services de reparation de smartphone en France ?"
   - "Comment faire reparer son iPhone rapidement ?"
   - "Ou trouver un reparateur mobile fiable ?"
3. Activez le toggle **Actif** pour chaque question
4. Cliquez sur **Sauvegarder**

### 8.4 Lancer une analyse manuelle

1. Onglet **Tableau de bord**
2. Cliquez sur **Lancer les questions dues** (ou **Forcer toutes** pour ignorer le planning)
3. Attendez 10-30 secondes (selon le nombre de questions × providers)
4. Le toast affichera le nombre d'analyses creees

### 8.5 Verifier les resultats

1. Onglet **Resultats** : vous devez voir une ligne par question × provider
2. Cliquez sur une ligne pour deplier et voir la reponse brute
3. Onglet **Tableau de bord** : les KPI et Share of Voice se sont mis a jour
4. Onglet **Recommandations** : apparaitra si des concurrents sont cites mais pas vous

---

## Troubleshooting

### "No AI-CMO profile configured"
Vous avez oublie l'etape 8.1. Remplissez le profil et sauvegardez.

### "No LLM API keys configured"
Les secrets n'ont pas ete ajoutes. Verifiez avec `supabase secrets list`.

### Le cron ne s'execute pas
```sql
-- Verifier l'historique d'execution du cron
SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'ai-cmo-worker') ORDER BY start_time DESC LIMIT 10;
```

### Erreur CORS / 401 depuis le frontend
Le bouton manuel dans l'admin utilise `supabase.functions.invoke()` qui gere automatiquement l'auth. Si vous avez une erreur, verifiez que l'utilisateur est bien authentifie comme admin.

### Voir les logs de la function
Dashboard > Functions > ai-cmo-worker > **Logs**

Ou via CLI :
```bash
supabase functions logs ai-cmo-worker
```

---

## Script automatise

Pour eviter les etapes manuelles, utilisez le script :
```bash
chmod +x scripts/deploy-ai-cmo.sh
./scripts/deploy-ai-cmo.sh
```

Il couvre les etapes 3 a 6 en interactif. Les etapes 1, 2 et 7 restent manuelles (installation CLI, login, cron).

---

## Coûts estimes

Pour **10 questions x 2 providers x execution quotidienne** :
- OpenAI gpt-4o-mini : ~6$/mois
- Google Gemini 2.0 Flash : ~0$ (gratuit dans les limites)
- Perplexity Sonar : ~12$/mois

**Total typique** : 5-20$/mois selon les providers actives et la frequence.

---

## Aller plus loin

- **Modifier les frequences** : Editez chaque question dans l'onglet Questions (1h/6h/12h/quotidien/hebdomadaire)
- **Changer les modeles LLM** : Editez `supabase/functions/ai-cmo-worker/index.ts` (ex: passer de `gpt-4o-mini` a `gpt-4o`)
- **Ajouter d'autres providers** : Ajoutez une fonction `callXXX()` et l'ajouter au tableau `providers`
- **Personnaliser les recommandations** : Modifiez le prompt dans la fonction `generateRecommendations()`
