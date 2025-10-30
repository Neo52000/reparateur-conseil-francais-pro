# 📅 Automatisation Hebdomadaire du Blog

## Vue d'ensemble

Système d'automatisation pour générer et publier automatiquement des articles d'actualités chaque lundi matin à 8h00.

## 🚀 Installation

### 1. Exécuter la migration SQL

Ouvrez le **SQL Editor** dans votre dashboard Supabase et exécutez le contenu du fichier :

```
supabase/manual-migrations/blog_automation_setup.sql
```

Cette migration va :
- ✅ Créer la table `blog_automation_config`
- ✅ Configurer les RLS policies (admin uniquement)
- ✅ Créer le cron job hebdomadaire (lundis à 8h00)
- ✅ Créer les fonctions de monitoring

### 2. Vérifier l'installation

Testez que tout fonctionne :

```sql
-- Vérifier la configuration
SELECT * FROM blog_automation_config;

-- Vérifier le statut du cron
SELECT * FROM get_blog_automation_status();

-- Voir l'historique des exécutions
SELECT * FROM blog_automation_cron_history LIMIT 10;
```

## 📋 Configuration

### Interface Admin

1. Allez dans **Admin → Blog → Onglet "Auto"**
2. Configurez les paramètres :
   - **Activer l'automatisation** : ON/OFF
   - **Publication automatique** : 
     - `ON` = Publie directement l'article
     - `OFF` = Crée l'article en statut "pending" pour validation
   - **Jour de la semaine** : Lundi par défaut
   - **Heure** : 08:00 par défaut

### Configuration avancée (SQL)

Modifiez directement dans la table :

```sql
UPDATE blog_automation_config
SET 
  enabled = true,              -- Activer/désactiver
  auto_publish = false,        -- Publication automatique ou validation
  schedule_day = 1,            -- 0=Dimanche, 1=Lundi, etc.
  schedule_time = '08:00',     -- Heure de publication
  ai_model = 'google/gemini-2.5-flash'  -- Modèle IA à utiliser
WHERE id = (SELECT id FROM blog_automation_config LIMIT 1);
```

## 🧪 Test

### Depuis l'interface

Cliquez sur le bouton **"Tester maintenant"** dans l'onglet Auto.

### Depuis le SQL Editor

```sql
-- Déclencher manuellement le cron
SELECT cron.unschedule('weekly-blog-automation');
SELECT cron.schedule(
  'weekly-blog-automation-test',
  '* * * * *',  -- Toutes les minutes pour test
  $$
  SELECT
    net.http_post(
        url:='https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/weekly-blog-automation',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:='{"auto_publish": false, "test_mode": true}'::jsonb
    ) as request_id;
  $$
);

-- Attendre 1-2 minutes puis vérifier
SELECT * FROM blog_posts 
WHERE ai_generated = true 
ORDER BY created_at DESC 
LIMIT 1;

-- Revenir au schedule normal
SELECT cron.unschedule('weekly-blog-automation-test');
SELECT cron.schedule(
  'weekly-blog-automation',
  '0 8 * * 1',
  $$ [même commande que ci-dessus mais sans test_mode] $$
);
```

### Depuis curl

```bash
curl -X POST https://nbugpbakfkyvvjzgfjmw.supabase.co/functions/v1/weekly-blog-automation \
  -H "Content-Type: application/json" \
  -d '{"auto_publish": false, "test_mode": true}'
```

## 📊 Monitoring

### Dashboard Admin

L'onglet "Auto" affiche :
- ✅ Statut du cron (actif/inactif)
- 📅 Dernière exécution
- ⏰ Prochaine exécution
- ⚠️ Dernier statut (succeeded/failed)
- 🔴 Messages d'erreur éventuels

### Logs des Edge Functions

Consultez les logs de la fonction `weekly-blog-automation` :

```sql
-- Voir l'historique complet
SELECT * FROM blog_automation_cron_history 
ORDER BY start_time DESC 
LIMIT 20;

-- Voir uniquement les erreurs
SELECT * FROM blog_automation_cron_history 
WHERE status != 'succeeded'
ORDER BY start_time DESC;
```

### Logs Admin

Tous les articles générés sont loggés :

```sql
SELECT * FROM admin_audit_logs 
WHERE action = 'weekly_blog_automation'
ORDER BY created_at DESC;
```

## 🔧 Fonctionnement Technique

### Workflow

1. **Cron déclenche** l'Edge Function `weekly-blog-automation` tous les lundis à 8h00
2. **Récupération des actualités** via Lovable AI (Gemini Flash)
   - Prompt : "Actualités de la semaine en téléphonie mobile et réparation"
   - Période : 7 derniers jours
3. **Génération de l'article** via Lovable AI
   - Structure : Intro + 3-5 actualités + Conclusion
   - Optimisation SEO automatique
   - Format Markdown
4. **Sauvegarde en base** avec statut selon config :
   - `published` si `auto_publish = true`
   - `pending` si `auto_publish = false` (validation manuelle)
5. **Logging** dans `admin_audit_logs` et `ai_analytics`

### Modèles IA utilisés

- **google/gemini-2.5-flash** : Rapide, économique, excellent pour actualités
- Fallback possible vers Perplexity, OpenAI, Mistral (à configurer)

### Format du cron

```
0 8 * * 1
│ │ │ │ │
│ │ │ │ └─ Jour de la semaine (0-6, 0=dimanche, 1=lundi)
│ │ │ └─── Mois (1-12)
│ │ └───── Jour du mois (1-31)
│ └─────── Heure (0-23)
└───────── Minute (0-59)
```

Exemples :
- `0 8 * * 1` = Lundis à 8h00
- `0 9 * * 1` = Lundis à 9h00
- `0 8 * * 5` = Vendredis à 8h00
- `0 20 * * 0` = Dimanches à 20h00

## 🛠️ Résolution de problèmes

### L'automatisation ne se déclenche pas

```sql
-- Vérifier que le cron existe
SELECT * FROM cron.job WHERE jobname = 'weekly-blog-automation';

-- Vérifier les exécutions
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-blog-automation')
ORDER BY start_time DESC 
LIMIT 5;

-- Si le cron n'existe pas, le recréer
-- (exécuter le contenu du fichier blog_automation_setup.sql)
```

### Les articles ne sont pas générés

```sql
-- Vérifier la configuration
SELECT * FROM blog_automation_config;

-- Vérifier que enabled = true
UPDATE blog_automation_config SET enabled = true;

-- Vérifier les logs de l'Edge Function
-- Aller dans Dashboard > Edge Functions > weekly-blog-automation > Logs
```

### Erreurs de rate limit IA

Si vous voyez "Rate limit exceeded" :

1. Vérifier les crédits Lovable AI
2. Espacer les tests (ne pas déclencher toutes les minutes)
3. Configurer un modèle alternatif si nécessaire

### Articles de mauvaise qualité

Ajustez le prompt dans `supabase/functions/weekly-blog-automation/index.ts` :

```typescript
const newsPrompt = `[Votre nouveau prompt ici...]`;
const articlePrompt = `[Votre nouveau prompt ici...]`;
```

Puis redéployez l'Edge Function (automatique avec Lovable).

## 📈 Améliorations futures

- [ ] Génération d'images d'en-tête automatiques
- [ ] Publication automatique sur réseaux sociaux
- [ ] Envoi newsletter aux abonnés
- [ ] A/B testing des titres
- [ ] Personnalisation par audience (public vs réparateurs)
- [ ] Multi-langues
- [ ] Intégration avec analytics pour optimiser les sujets

## 🔐 Sécurité

- ✅ Fonction accessible sans authentification (cron)
- ✅ Configuration réservée aux admins (RLS)
- ✅ Logs complets pour audit
- ✅ Validation possible avant publication

## 📞 Support

En cas de problème :

1. Vérifier les logs de l'Edge Function
2. Vérifier le statut du cron : `SELECT * FROM get_blog_automation_status()`
3. Tester manuellement : Bouton "Tester maintenant"
4. Consulter `blog_automation_cron_history` pour l'historique

---

**Date de création** : 30 janvier 2025  
**Version** : 1.0.0
