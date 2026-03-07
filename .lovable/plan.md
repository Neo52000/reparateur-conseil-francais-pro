
# Audit complet : ce qui reste a implementer (hors Stripe)

## Resume

Apres les 5 sprints, la majorite de la plateforme est fonctionnelle. Cependant, il reste **4 categories** de travaux incomplets, principalement concentres dans le module POS et le module Publicite.

---

## 1. Module POS (Point de Vente) - Donnees simulees

Le POS est le module le plus concerne. Presque tous ses sous-composants utilisent des donnees mock au lieu de requetes Supabase reelles.

| Fichier | Probleme |
|---------|----------|
| `pos/modules/ReportsAnalytics.tsx` | mockSalesData, mockTopProducts, mockStaffPerformance au lieu de requetes sur `pos_transactions` |
| `pos/modules/RepairTrackingManager.tsx` | mockOrders au lieu de requeter `pos_repair_orders` |
| `pos/modules/DigitalPoliceLogbook.tsx` | mockEntries au lieu de requeter la table `police_logbook` |
| `pos/advanced/CustomerCRMManager.tsx` | mockCustomers et mockHistory au lieu de requeter `pos_customers` |
| `pos/AuditTrail.tsx` | mockLogs au lieu de requeter `audit_logs` |
| `pos/ui/POSSessionManager.tsx` | mockSessionData pour les stats de session au lieu des vraies transactions |
| `pos/AdvancedReporting.tsx` | mockSalesData et mockProductPerformance |
| `pos/PaymentIntegrationsPanel.tsx` | Simulation du test de connexion terminaux |

**Effort estime** : Moyen-eleve (chaque composant necessite une requete Supabase et une adaptation des types)

---

## 2. Module Publicite / Campagnes - Squelettes vides

| Fichier | Probleme |
|---------|----------|
| `advertising/AdvertisingDashboard.tsx` | Graphiques de performance, module campagnes et module analytics marques "A implementer" |
| `advertising/AdvertisingAIDashboard.tsx` | Meme probleme : graphique placeholder |
| `advertising/AutomatedCampaigns.tsx` | La mise a jour de campagne est un TODO |

**Effort estime** : Moyen (utiliser Recharts deja installe pour les graphiques, connecter aux tables existantes)

---

## 3. Notifications - Actions manquantes

| Fichier | Probleme |
|---------|----------|
| `notifications/SmartNotificationCenter.tsx` | `markAsRead` et `markAllAsRead` sont des TODO vides - ils affichent un toast sans modifier la base |

**Effort estime** : Faible (simple UPDATE sur la table `notifications`)

---

## 4. TODOs mineurs restants

| Fichier | Probleme |
|---------|----------|
| `calendar/AppointmentBookingModal.tsx` | Encore un `setTimeout` de simulation + TODO "integrer le vrai systeme de paiement" |
| `repairer/RepairerClaimModal.tsx` | Simulation de la revendication de fiche (`setTimeout` au lieu d'un insert reel) |
| `search/SearchResultsWithPricing.tsx` | TODO : envoi de demande de devis avec delai 24h |
| `admin/AdminDashboardContent.tsx` | `totalInterests` et `totalRevenue` en dur a 0 |
| `admin/super-admin/APIManager.tsx` | TODO : modale de configuration specifique aux integrations |
| `pages/LegalNotice.tsx` | Informations legales placeholder (SIRET, RCS, adresse) |
| `repairer-dashboard/inventory/InventoryManagement.tsx` | mockSuppliers au lieu de vraies donnees fournisseurs |
| `hooks/useRepairerProfileSave.ts` | Simulation de sauvegarde pour les profils mock |
| `payment/PaymentForm.tsx` | Simulation du paiement (lie a Stripe) |
| `payments/StripeTerminal.tsx` | Simulation complete du terminal (lie a Stripe) |

---

## 5. Ce qui est fonctionnel

Pour reference, voici ce qui marche deja sans Stripe :

- Authentification et gestion des roles
- Recherche avec carte interactive et matching IA
- Dashboard reparateur (devis, statistiques, profil)
- Dashboard client (messagerie temps reel, rendez-vous)
- Chatbot avec actions open_booking et open_faq
- Systeme de leads par niveau d'abonnement
- Blog et SEO programmatique (pages ville/modele/panne)
- Pages institutionnelles (A propos, Garantie, Guide)
- Marketplace accessoires
- Scraping et enrichissement des fiches
- Administration complete
- Filtres de recherche sauvegardes
- Cache global et optimisations de performance

---

## Plan d'action recommande

### Sprint 6a - Notifications et TODOs rapides (faible effort)
1. Implementer `markAsRead` / `markAllAsRead` dans SmartNotificationCenter
2. Connecter `RepairerClaimModal` a un vrai insert dans une table `repairer_claims`
3. Connecter `AdminDashboardContent` aux vraies donnees (count client_interests + sum revenues)
4. Implementer l'envoi de demande de devis avec timer 24h dans SearchResultsWithPricing
5. Remplir les mentions legales dans LegalNotice.tsx (vous devrez fournir les infos)

### Sprint 6b - Module POS (effort moyen-eleve)
1. Connecter ReportsAnalytics aux tables `pos_transactions` et `pos_inventory_items`
2. Connecter RepairTrackingManager aux vraies commandes de reparation
3. Connecter CustomerCRMManager aux donnees clients reels
4. Connecter AuditTrail a la table `audit_logs`
5. Connecter POSSessionManager aux vraies stats de session
6. Connecter DigitalPoliceLogbook aux donnees reelles

### Sprint 6c - Module Publicite (effort moyen)
1. Implementer les graphiques Recharts dans AdvertisingDashboard
2. Connecter les campagnes automatisees au backend
3. Ajouter le module analytics publicitaire

---

## Section technique

### Tables Supabase a verifier/creer
- `repairer_claims` : pour la revendication de fiches
- `pos_transactions` : deja existante, a utiliser dans les rapports POS
- `advertising_campaigns` : pour le module publicite
- `advertising_analytics` : pour les stats publicitaires

### Dependance Stripe
Les fichiers `PaymentForm.tsx`, `StripeTerminal.tsx`, `PaymentIntegrationsPanel.tsx` et `AppointmentBookingModal.tsx` (partie paiement) ne pourront etre finalises qu'avec la cle API Stripe.

### Priorite recommandee
Le Sprint 6a (corrections rapides) peut etre fait immediatement. Le Sprint 6b (POS) n'est utile que pour les reparateurs Premium (niveau 3). Le Sprint 6c (Publicite) est une fonctionnalite future de monetisation.

Souhaitez-vous que je commence par le Sprint 6a (corrections rapides) ?
