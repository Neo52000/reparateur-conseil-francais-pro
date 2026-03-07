

# Plan Evolution TopReparateurs - Sprints 1 a 5

## Vue d'ensemble

Ce plan organise toutes les corrections, optimisations et fonctionnalites manquantes en 5 sprints progressifs. Chaque sprint est concu pour livrer de la valeur incrementale sans casser l'existant.

---

## Sprint 1 : Corrections TODO et Reactivation des Modules

### 1.1 Corriger les TODOs critiques (26 fichiers identifies)

**RepairerQuotesTab.tsx** - Filtrer les devis par repairer_id de l'utilisateur connecte :
- Chercher le repairer_id via la table `repairers` en utilisant `user.id`
- Ajouter un filtre `.eq('repairer_id', repairerId)` a la requete
- Creer un modal de reponse au devis (accepter/refuser avec prix et notes)

**ClientInterestManagement.tsx** - Remplacer les donnees mock par des vraies requetes Supabase :
- Creer une table `client_interests` si elle n'existe pas
- Charger les interets depuis la base de donnees
- Implementer l'approbation/rejet avec envoi de leads selon le niveau d'abonnement

**SavedSearchFilters.tsx** - Connecter au backend :
- Creer une table `saved_search_filters` (user_id, name, filters jsonb, alerts_enabled, created_at)
- Implementer le CRUD complet (charger, sauvegarder, supprimer)
- Connecter le bouton "Rechercher" a la navigation vers `/search` avec les filtres en query params

**useReviewsStats** - Completer les statistiques globales :
- Calculer les top 10 reparateurs les mieux notes (GROUP BY repairer_id, ORDER BY avg(rating))
- Recuperer les 10 avis les plus recents avec le nom du reparateur

**AlexChatWidget.tsx** - Implementer les actions :
- `open_booking` : ouvrir le composant `AppointmentBookingModal` existant via un state
- `open_faq` : naviguer vers `/repairer-faq` au lieu d'ouvrir `/faq` (qui n'existe pas)

**ChatbotLayout.tsx** - Reactiver le chatbot avec un feature flag :
- Ajouter une variable d'environnement ou un flag dans `chatbot_configuration`
- Reactiver `<BenChatWidget />` conditionnellement

**AppointmentBookingModal.tsx** - Connecter au vrai systeme :
- Remplacer le `setTimeout` par un insert dans la table `appointments`
- Envoyer une notification au reparateur

### 1.2 Reactiver les modules desactives

**AdminPage.tsx - Sous-domaines et Landing Pages** :
- Reimporter `SubdomainsManagement` et `LandingPagesManagement`
- Remplacer les `DisabledFeaturePlaceholder` par les vrais composants
- Ajouter un toggle dans la configuration admin pour activer/desactiver ces modules

### 1.3 Notifications dans invoiceAutomationService.ts

- Utiliser l'Edge Function `send-notification` existante pour :
  - Rappels de paiement (3 jours avant echeance)
  - Notification de generation de facture
  - Alerte documents legaux manquants
- Remplacer les `console.log` par des appels reels a l'Edge Function

---

## Sprint 2 : Performance et Qualite du Code

### 2.1 Optimisation du cache et des requetes

- Etendre le `TTLCache` de `useRepairersOptimized` a tous les hooks de donnees
- Ajouter un cache React Query global avec `staleTime: 5 * 60 * 1000` dans le QueryClient
- Implementer un prefetch sur les pages les plus visitees (accueil, recherche)

### 2.2 Nettoyage du code

- Supprimer les `console.log` de production (environ 150+ occurrences)
- Ajouter le mode strict du logger (deja present dans `utils/logger.ts`)
- Supprimer les imports inutilises et les composants wrappers vides
- Migrer les derniers composants non-lazy vers `React.lazy()`

### 2.3 Core Web Vitals

- Ajouter des composants Skeleton pour les listes de reparateurs et le dashboard
- Implementer `loading="lazy"` et `decoding="async"` sur toutes les images
- Optimiser le bundle avec un `splitChunks` dans la config Vite
- Mettre le composant `web-vitals` en production (deja installe mais peu utilise)

### 2.4 Accessibilite (WCAG 2.1 AA)

- Audit des contrastes de couleur sur les badges et boutons
- Ajouter les attributs `aria-label` sur les boutons iconiques
- Implementer la navigation clavier dans les modales et menus
- Ajouter `role` et `aria-live` pour les notifications toast

### 2.5 Monitoring

- Configurer Sentry avec des breadcrumbs pour les actions utilisateur (deja installe)
- Ajouter des metriques custom pour les temps de chargement des pages
- Configurer des alertes pour les erreurs critiques (taux > 1%)

---

## Sprint 3 : Fonctionnalites Business

### 3.1 Integration Stripe (Paiements et Abonnements)

- Activer l'integration Stripe via l'outil Lovable
- Creer les produits Stripe pour les plans : Visibilite (14.90EUR), Pro (49.90EUR), Premium (99.90EUR)
- Implementer le checkout pour les abonnements reparateurs
- Configurer les webhooks Stripe pour mettre a jour le statut d'abonnement
- Generer les factures automatiques avec TVA

### 3.2 Messagerie Client-Reparateur

Le composant `IntegratedMessaging.tsx` existe deja avec une bonne structure. Il faut :
- Creer la table `conversations` et `conversation_messages` si absentes
- Ajouter un bouton "Envoyer un message" sur les fiches reparateurs (plans Visibilite+)
- Integrer la messagerie dans le dashboard client et reparateur
- Ajouter les notifications en temps reel via Supabase Realtime

### 3.3 Agenda et Prise de Rendez-vous

Le composant `AdvancedAppointmentBooking.tsx` existe. Il faut :
- Connecter au backend : creneaux disponibles depuis la table `appointments`
- Permettre aux reparateurs de definir leurs horaires disponibles
- Implementer les confirmations et annulations avec notifications
- Rendre accessible depuis le chatbot (action `open_booking`) et les fiches

### 3.4 Gestion des Leads par Niveau

- Les leads gratuits voient uniquement les reparateurs proches
- Niveau 1 : recoit les leads de sa zone (limites a 5/mois)
- Niveau 2 : leads illimites + devis en ligne
- Niveau 3 : leads prioritaires + exclusivite zone

---

## Sprint 4 : Contenu et SEO

### 4.1 Pages programmatiques "Ville + Modele + Panne"

Le systeme de base existe (`ModelCityPage`, `SymptomPage`, `HubCityPage`). Il faut :
- Generer automatiquement le contenu via l'Edge Function `blog-ai-generator`
- Creer une table `programmatic_pages` pour stocker le contenu genere
- Ajouter les FAQ dynamiques avec Schema.org FAQPage
- Integrer les prix moyens et les CTA vers les reparateurs locaux

### 4.2 Enrichissement des fiches non revendiquees (Niveau 0)

- Generer automatiquement du contenu neutre (services detectes, zone de couverture)
- Ajouter les balises Schema.org LocalBusiness sur toutes les fiches
- Afficher les horaires generiques et la zone geographique estimee

### 4.3 Pages institutionnelles

Creer les pages suivantes via le StaticPagesManager existant :
- "Qui sommes-nous ?" (`/a-propos`)
- "Notre garantie" (`/garantie`)
- "Comment choisir un reparateur" (`/guide-choix-reparateur`)

### 4.4 Blog pedagogique

- Programmer la publication automatique d'articles via `blog-auto-publish`
- Themes : prix reparation par modele, indice reparabilite, conseils entretien
- Ajouter les liens internes vers les pages programmatiques

---

## Sprint 5 : IA et Marketplace

### 5.1 Matching IA Client-Reparateur

Le systeme existe deja (`aiRepairerMatcher.ts`, `aiQueryParser.ts`). Il faut :
- Affiner le scoring multi-criteres (pertinence 35%, distance 25%, note 20%, niveau 15%, delai 5%)
- Afficher le score de matching et les raisons de la recommandation sur les resultats
- Integrer le matching dans le chatbot pour les recommandations personnalisees

### 5.2 Analytics Reparateurs

- Creer un dashboard de statistiques pour les reparateurs (plan Pro+) :
  - Nombre de vues de la fiche
  - Nombre de demandes de devis recues
  - Taux de conversion (vue -> devis -> RDV)
  - Comparaison avec la moyenne locale
- Stocker les metriques dans une table `repairer_analytics`

### 5.3 POS NF525 et Exclusivite

Le systeme POS et les zones d'exclusivite existent deja. Il faut :
- Connecter le POS aux paiements Stripe
- Synchroniser les transactions POS avec les factures electroniques
- Finaliser le dashboard des revenus par zone

### 5.4 Marketplace Accessoires (Preparation)

- Creer la structure de base pour les produits (coques, batteries, protections)
- Integrer avec les fiches reparateurs pour le cross-selling
- Preparer l'integration Shopify pour les reparateurs Premium

---

## Fichiers a creer

| Sprint | Fichier | Description |
|--------|---------|-------------|
| 1 | `src/components/quotes/QuoteResponseModal.tsx` | Modal de reponse aux devis |
| 1 | `supabase/migrations/xxx_client_interests.sql` | Table client_interests |
| 1 | `supabase/migrations/xxx_saved_filters.sql` | Table saved_search_filters |
| 3 | `supabase/migrations/xxx_conversations.sql` | Tables messagerie |
| 4 | `supabase/migrations/xxx_programmatic_pages.sql` | Table pages programmatiques |
| 5 | `supabase/migrations/xxx_repairer_analytics.sql` | Table analytics reparateurs |

## Fichiers a modifier (principaux)

| Sprint | Fichier | Modification |
|--------|---------|--------------|
| 1 | `src/components/repairer-dashboard/RepairerQuotesTab.tsx` | Filtrage par repairer_id + modal reponse |
| 1 | `src/components/ClientInterestManagement.tsx` | Remplacement mock par Supabase |
| 1 | `src/components/search/SavedSearchFilters.tsx` | CRUD backend |
| 1 | `src/hooks/useReviews.ts` | Completer useReviewsStats |
| 1 | `src/components/chatbot/AlexChatWidget.tsx` | Actions open_booking et open_faq |
| 1 | `src/components/ChatbotLayout.tsx` | Reactiver chatbot |
| 1 | `src/pages/AdminPage.tsx` | Reactiver sous-domaines/landing pages |
| 1 | `src/services/invoiceAutomationService.ts` | Vraies notifications |
| 2 | `src/App.tsx` | QueryClient avec cache global |
| 2 | Multiples composants | Skeleton loaders, lazy loading |
| 3 | `src/components/messaging/IntegratedMessaging.tsx` | Connexion backend |
| 3 | `src/components/appointments/AdvancedAppointmentBooking.tsx` | Backend creneaux |
| 5 | `src/pages/RepairerDashboardPage.tsx` | Onglet analytics |

---

## Contraintes respectees

- Aucune URL existante ne sera modifiee ou supprimee
- Retrocompatibilite totale avec les routes SEO actuelles
- Mobile-first : toutes les nouvelles interfaces sont responsive
- Free tier Supabase : les Edge Functions restent sous le quota (environ 25 actives)
- Fallback IA : Lovable AI -> OpenAI -> Gemini -> Mistral sur toutes les fonctions IA

---

## Recommandation d'execution

Vu l'ampleur du plan, je recommande de commencer par le **Sprint 1** qui corrige les bugs et les TODOs, puis d'avancer sprint par sprint. Chaque sprint peut etre approuve et implemente independamment.

Souhaitez-vous que je commence par le Sprint 1 (corrections TODO et reactivation des modules) ?

