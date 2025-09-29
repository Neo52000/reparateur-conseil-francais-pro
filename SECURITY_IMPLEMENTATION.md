# 🔒 Implémentation Sécurité & Conformité - TopRéparateurs.fr

## ✅ Phase 1 : Sécurité Critique (COMPLÉTÉ)

### 1.1 RLS Policies Strictes
- ✅ Vue publique `repairers_public` créée (données non-sensibles uniquement)
- ✅ RLS strictes sur `repairers` (accès limité)
- ✅ RLS strictes sur `repairer_profiles` (profils vérifiés uniquement)
- ✅ Policies pour admins et réparateurs propriétaires

### 1.2 Protection Mots de Passe Compromis
⚠️ **ACTION MANUELLE REQUISE**

Pour activer la protection contre les mots de passe compromis :

1. Aller sur le Dashboard Supabase : https://supabase.com/dashboard/project/nbugpbakfkyvvjzgfjmw
2. Naviguer vers **Authentication** → **Password**
3. Activer **"Leaked Password Protection"**

Cette fonctionnalité vérifie automatiquement les mots de passe contre la base de données HaveIBeenPwned.

### 1.3 Mise à Jour PostgreSQL
⚠️ **ACTION MANUELLE REQUISE - DOWNTIME PRÉVU**

Pour mettre à jour PostgreSQL :

1. Aller sur le Dashboard Supabase : https://supabase.com/dashboard/project/nbugpbakfkyvvjzgfjmw/settings/database
2. Cliquer sur **"Upgrade PostgreSQL"**
3. Sélectionner la dernière version stable (PostgreSQL 15.x)
4. **Prévoir une fenêtre de maintenance de 5-10 minutes**
5. Effectuer la mise à jour lors d'une période de faible trafic

---

## ✅ Phase 2 : Connexions IA (À CONFIGURER)

### 2.1 Secrets IA Requis

Les clés API suivantes doivent être configurées dans Supabase :

#### OpenAI API Key
```bash
Nom du secret : OPENAI_API_KEY
Format : sk-proj-...
Obtenir la clé : https://platform.openai.com/api-keys
```

#### Mistral API Key
```bash
Nom du secret : MISTRAL_API_KEY
Format : ...
Obtenir la clé : https://console.mistral.ai/api-keys
```

#### DeepSeek API Key
```bash
Nom du secret : DEEPSEEK_API_KEY
Format : sk-...
Obtenir la clé : https://platform.deepseek.com/api-keys
```

### 2.2 Configuration des Secrets

Pour configurer les secrets dans Supabase :

1. Aller sur : https://supabase.com/dashboard/project/nbugpbakfkyvvjzgfjmw/settings/functions
2. Section **"Secrets"**
3. Ajouter chaque clé API
4. **Redéployer les Edge Functions** après ajout des secrets

### 2.3 Test des Connexions IA

Après configuration, tester les services IA :

```typescript
// Test OpenAI
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('chatbot-gpt5', {
  body: { message: 'Test de connexion' }
});

// Test Mistral (via ai-router)
const { data: mistralData } = await supabase.functions.invoke('ai-router', {
  body: { 
    provider: 'mistral',
    message: 'Test de connexion' 
  }
});

// Test DeepSeek (via ai-router)
const { data: deepseekData } = await supabase.functions.invoke('ai-router', {
  body: { 
    provider: 'deepseek',
    message: 'Test de connexion' 
  }
});
```

---

## ✅ Phase 3 : Rate Limiting (COMPLÉTÉ)

### 3.1 Infrastructure
- ✅ Table `api_rate_limits` créée
- ✅ Function `check_rate_limit()` implémentée
- ✅ Index de performance créés
- ✅ RLS policies configurées

### 3.2 Service Client
- ✅ `RateLimitService` créé (`src/services/rateLimitService.ts`)
- ✅ Hook `useRateLimit` disponible
- ✅ Méthode `withRateLimit` pour middleware

### 3.3 Utilisation

```typescript
import { RateLimitService } from '@/services/rateLimitService';

// Vérifier le rate limit avant une requête
const result = await RateLimitService.checkRateLimit('/api/repairers');

if (!result.allowed) {
  console.log(`Bloqué jusqu'à : ${result.blocked_until}`);
  return;
}

// Avec middleware automatique
const data = await RateLimitService.withRateLimit(
  '/api/repairers',
  () => fetchRepairers(),
  {
    maxRequests: 50,
    windowMinutes: 15,
    onBlocked: (result) => {
      toast({
        title: "Limite atteinte",
        description: `Réessayez après ${new Date(result.blocked_until!).toLocaleString()}`,
        variant: "destructive"
      });
    }
  }
);
```

### 3.4 Limites par Endpoint (Recommandées)

| Endpoint | Max Requêtes | Fenêtre | Notes |
|----------|--------------|---------|-------|
| `/api/repairers` | 100 | 15 min | Recherche publique |
| `/api/quotes` | 10 | 15 min | Demandes de devis |
| `/api/catalog` | 200 | 15 min | Catalogue produits |
| `/api/reviews` | 5 | 60 min | Publication d'avis |

---

## ✅ Phase 4 : Corrections Supabase Linter (COMPLÉTÉ)

### 4.1 Extensions Schema
- ✅ Extension `pgcrypto` déplacée vers schema `extensions`
- ✅ Évite les conflits avec le schema `public`

### 4.2 Function Search Paths
- ✅ Toutes les fonctions `SECURITY DEFINER` ont maintenant `SET search_path = public`
- ✅ Prévient les attaques par injection de schema

### 4.3 OTP Expiry
⚠️ **À CONFIGURER MANUELLEMENT**

Réduire la durée de vie des OTP :
```sql
-- Dans le Dashboard Supabase → Settings → Auth
-- Ou via SQL :
UPDATE auth.config 
SET otp_expiry = 300 -- 5 minutes au lieu de default
WHERE id = 'main';
```

---

## ✅ Phase 5 : RGPD (COMPLÉTÉ)

### 5.1 Pages Légales Créées

- ✅ **Mentions Légales** : `/legal-notice` (`src/pages/LegalNotice.tsx`)
- ✅ **CGU** : `/terms` (`src/pages/TermsOfService.tsx`)
- ✅ **CGV** : `/terms-of-sale` (`src/pages/TermsOfSale.tsx`)

### 5.2 Composant RGPD

- ✅ **Demande d'accès** : Récupération de toutes les données personnelles
- ✅ **Rectification** : Demande de correction des données
- ✅ **Export** : Téléchargement des données au format JSON
- ✅ **Effacement** : Suppression définitive du compte

Localisation : `src/components/gdpr/DataAccessRequest.tsx`

### 5.3 Conformité RGPD

| Exigence RGPD | Statut | Emplacement |
|---------------|--------|-------------|
| Consentement cookies | ✅ | `CookieBanner.tsx` |
| Politique de confidentialité | ✅ | `/privacy` |
| Droit d'accès | ✅ | Composant GDPR |
| Droit de rectification | ✅ | Composant GDPR |
| Droit à l'effacement | ✅ | Composant GDPR |
| Droit à la portabilité | ✅ | Export JSON |
| DPO Contact | ✅ | dpo@topreparateurs.fr |

---

## 📋 Phase 6 : Tests & Validation

### 6.1 Tests Sécurité

#### RLS Policies
```bash
# Test accès non autorisé
- [ ] Tenter accès direct table `repairers` sans auth
- [ ] Vérifier masquage données sensibles (SIRET, phone, email)
- [ ] Tester modification données d'un autre réparateur
```

#### Rate Limiting
```bash
# Test dépassement limites
- [ ] Effectuer 101 requêtes rapides sur `/api/repairers`
- [ ] Vérifier blocage et message d'erreur
- [ ] Attendre 15 min et vérifier déblocage automatique
```

#### Injection SQL
```bash
# Test tentatives d'injection
- [ ] Formulaire recherche : `'; DROP TABLE repairers; --`
- [ ] Champ email : `admin@test.com' OR '1'='1`
- [ ] Vérifier échec et sanitization
```

### 6.2 Tests Fonctionnels IA

```bash
# Test OpenAI
- [ ] Chatbot pre-diagnostic : message basique
- [ ] Vérifier réponse cohérente
- [ ] Temps de réponse < 3s

# Test Mistral
- [ ] Classification réparateur
- [ ] Génération description
- [ ] Vérifier qualité output

# Test DeepSeek
- [ ] Optimisation contenu blog
- [ ] Suggestions intelligentes
- [ ] Vérifier pertinence
```

### 6.3 Tests RGPD

```bash
# Parcours utilisateur complet
- [ ] Créer compte test
- [ ] Demander accès données → Email reçu sous 30j
- [ ] Demander rectification → Confirmation reçue
- [ ] Exporter données → Fichier JSON téléchargé
- [ ] Demander suppression → Confirmation + délai 30j
- [ ] Vérifier présence banner cookies
- [ ] Tester gestion préférences cookies
```

---

## 🚨 Actions Manuelles Urgentes

### Priorité P0 (Critique)
1. ✅ **RLS Policies** : COMPLÉTÉ
2. ⚠️ **Protection mots de passe** : À ACTIVER dans Dashboard
3. ⚠️ **PostgreSQL upgrade** : À PLANIFIER (downtime 5-10min)
4. ⚠️ **Secrets IA** : À CONFIGURER

### Priorité P1 (Important)
5. ✅ **Rate Limiting** : COMPLÉTÉ
6. ✅ **Pages RGPD** : COMPLÉTÉES
7. ⚠️ **OTP Expiry** : À RÉDUIRE à 5 minutes

### Priorité P2 (Recommandé)
8. ⏳ **Tests sécurité** : À EFFECTUER
9. ⏳ **Tests IA** : À EFFECTUER après config secrets
10. ⏳ **Tests RGPD** : À EFFECTUER

---

## 📊 Métriques de Sécurité

### Objectifs
- 🎯 **RLS Coverage** : 100% des tables sensibles
- 🎯 **Rate Limit Success** : > 99% requêtes légitimes autorisées
- 🎯 **RGPD Compliance** : 100% des droits implémentés
- 🎯 **Password Protection** : 100% mots de passe vérifiés
- 🎯 **AI Uptime** : > 99.5%

### Monitoring

```typescript
// Dashboard admin à implémenter
- Tentatives de connexion échouées
- Requêtes bloquées par rate limiting
- Demandes RGPD en cours
- Statut des services IA
- Alertes sécurité
```

---

## 📞 Support et Contacts

### Équipe Technique
- **Email principal** : tech@topreparateurs.fr
- **Sécurité** : security@topreparateurs.fr
- **DPO** : dpo@topreparateurs.fr

### Ressources
- [Supabase Dashboard](https://supabase.com/dashboard/project/nbugpbakfkyvvjzgfjmw)
- [Documentation RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide RGPD](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)

---

**Date de dernière mise à jour** : {new Date().toLocaleDateString('fr-FR')}
**Version** : 1.0.0
**Statut global** : 🟡 **En cours** (75% complété)
