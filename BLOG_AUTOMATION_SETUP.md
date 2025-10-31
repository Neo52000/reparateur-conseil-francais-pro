# 🤖 Configuration Automatisation Blog - Statut Actuel

## ✅ Implémentation Complétée

### Phase A - Stabilisation Admin ✅
- **Détection Admin unifiée** : Utilise `user_roles` via RPC `has_role()`
- **Client Supabase unique** : Consolidé sur `@/integrations/supabase/client`
- **Bouton "Test"** : Appelle directement `blog-ai-generator` (plus fiable)
- **Validation CRUD** : Vérification `schedule_day` (0-6) et `schedule_time` (HH:mm)
- **RPC Status** : Fonction `get_blog_automation_status()` créée

### Phase B - Planification Cron ✅
- **Job quotidien créé** : `daily-blog-auto-publish` (8h00 chaque jour)
- **Extensions activées** : `pg_cron` et `pg_net`
- **Edge Function** : `blog-auto-publish` appelé automatiquement
- **ID Cron Job** : 4

### Phase C - Nettoyage E-commerce ✅
- **Intégrations legacy supprimées** : PrestaShop et WooCommerce retirés de `EcommerceDashboard`
- **Shopify uniquement** : Seule plateforme e-commerce conservée
- **POS conservé** : Système POS maintenu (utilisé par réparateurs)

## 🔐 Sécurité

### Rôles Admin
- **Stockage** : Table `user_roles` (sécurisé)
- **Vérification** : RPC `has_role(_user_id, _role)` avec `SECURITY DEFINER`
- **Compte admin** : reine.elie@gmail.com avec rôles `admin`, `repairer`, `user`

### RLS Policies
- `blog_automation_schedules` : Admin only (via `has_role()`)
- Edge Functions : Vérification JWT pour génération manuelle

## 📝 Utilisation

### 1. Accès Admin
1. Se connecter avec un compte admin
2. Aller dans `/admin?tab=blog`
3. Section "Automatisation des Articles"

### 2. Créer une Planification
1. Cliquer sur "Ajouter une planification"
2. Configurer :
   - Nom de la planification
   - Catégorie (optionnel)
   - Jour (0=Dimanche, 1=Lundi, ..., 6=Samedi)
   - Heure (format HH:mm, ex: 08:00)
   - Auto-publication (oui/non)
   - Modèle IA (défaut: google/gemini-2.5-flash)
3. Sauvegarder

### 3. Tester Manuellement
1. Cliquer sur "Tester une génération maintenant"
2. Un article sera créé en **brouillon** (statut: pending)
3. Redirection automatique vers la liste des articles
4. Réviser et publier l'article

### 4. Automatisation
- **Fréquence** : Quotidienne à 8h00
- **Comportement** : Prend la première planification "enabled" par priorité
- **Résultat** : Article créé selon configuration (draft ou publié)

## 🔧 Configuration Avancée

### Variables d'Environnement (Edge Functions)
```bash
LOVABLE_API_KEY=xxx  # Nécessaire pour génération IA
```

### Modifier le Cron
```sql
-- Voir les jobs actifs
SELECT * FROM cron.job;

-- Modifier la fréquence (exemple: toutes les heures)
SELECT cron.unschedule('daily-blog-auto-publish');
SELECT cron.schedule(
  'daily-blog-auto-publish',
  '0 * * * *', -- Toutes les heures
  $$ [même corps] $$
);
```

### Logs et Débogage
```typescript
// Console logs dans Edge Functions
// Voir dans Supabase Dashboard > Edge Functions > Logs

// Vérifier le statut cron
SELECT * FROM cron.job_run_details 
WHERE jobid = 4 
ORDER BY start_time DESC 
LIMIT 10;
```

## 🚨 Troubleshooting

### "Accès Restreint" affiché
- Vérifier rôle dans `user_roles` : `SELECT * FROM user_roles WHERE user_id = 'xxx'`
- S'assurer que `is_active = true`
- Vider le cache navigateur et reconnecter

### Test génération échoue
- Vérifier `LOVABLE_API_KEY` configuré
- Voir logs Edge Function `blog-ai-generator`
- Catégorie active existe dans `blog_categories`

### Cron ne s'exécute pas
- Vérifier job actif : `SELECT * FROM cron.job WHERE jobname = 'daily-blog-auto-publish'`
- Voir logs : `SELECT * FROM cron.job_run_details WHERE jobid = 4`
- Extensions activées : `SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net')`

### RLS bloque les opérations
- Vérifier politique RLS sur `blog_automation_schedules`
- Fonction `has_role()` doit exister et être accessible
- Compte doit avoir le rôle `admin` actif

## 📊 Monitoring

### Métriques à Surveiller
- Articles générés par jour
- Taux de succès/échec génération
- Temps d'exécution moyen
- Utilisation tokens IA

### Requêtes Utiles
```sql
-- Articles IA générés cette semaine
SELECT COUNT(*), status 
FROM blog_posts 
WHERE ai_generated = true 
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY status;

-- Dernières planifications exécutées
SELECT name, last_run_at, enabled 
FROM blog_automation_schedules 
ORDER BY last_run_at DESC;
```

## 🎯 Prochaines Améliorations

### Court Terme
- [ ] Dashboard statistiques génération IA
- [ ] Notifications admin en cas d'échec
- [ ] Preview article avant publication auto

### Moyen Terme
- [ ] Multiple crons (ex: matin + après-midi)
- [ ] A/B testing de prompts
- [ ] Optimisation SEO automatique

### Long Terme
- [ ] Génération d'images IA
- [ ] Publication réseaux sociaux
- [ ] Analyse performance articles IA

---

**Date implémentation** : 31 octobre 2025
**Version** : 1.0
**Mainteneur** : Admin reine.elie@gmail.com
