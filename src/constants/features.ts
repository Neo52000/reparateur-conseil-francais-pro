
import { PlanName, Feature } from "@/types/featureFlags";

/**
 * Plans d'abonnement disponibles dans l'ordre de montée en gamme
 */
export const PLANS: PlanName[] = ["Gratuit", "Basique", "Premium", "Enterprise"];

/**
 * Toutes les fonctionnalités disponibles organisées par catégorie
 */
export const FEATURES: Feature[] = [
  // Contrôle système
  { key: "demo_mode_enabled", name: "Mode démo activé", category: "Système" },

  // Fonctionnalités de base déjà implémentées
  { key: "search_brand_model", name: "Recherche par marque ET modèle spécifique", category: "Base" },
  { key: "filter_issue_type", name: "Filtres par type de panne", category: "Base" },
  { key: "geolocation", name: "Géolocalisation automatique", category: "Base" },
  { key: "sorting_advanced", name: "Tri par distance, prix, délai ou note", category: "Base" },

  // Blog et contenu
  { key: "blog_access_client", name: "Accès blog client", category: "Blog" },
  { key: "blog_access_repairer", name: "Accès blog réparateur", category: "Blog" },
  { key: "blog_exclusive_content", name: "Contenu exclusif réparateurs", category: "Blog" },
  { key: "blog_ai_suggestions", name: "Suggestions d'articles IA", category: "Blog" },
  { key: "blog_advanced_analytics", name: "Analytics blog avancées", category: "Blog" },
  { key: "blog_commenting", name: "Système de commentaires", category: "Blog" },
  { key: "blog_newsletter", name: "Newsletter automatique", category: "Blog" },
  { key: "blog_social_sharing", name: "Partage sur réseaux sociaux", category: "Blog" },

  // Espace client
  { key: "client_dashboard", name: "Espace client complet avec tableau de bord", category: "Client" },
  { key: "repair_history", name: "Historique des réparations", category: "Client" },
  { key: "appointments_management", name: "Gestion des rendez-vous", category: "Client" },
  { key: "favorites_system", name: "Système de favoris", category: "Client" },
  { key: "loyalty_program", name: "Programme de fidélité avec points", category: "Client" },

  // Système de tarification
  { key: "price_comparator", name: "Comparateur de prix entre réparateurs", category: "Tarification" },
  { key: "market_analysis", name: "Analyse du marché avec statistiques", category: "Tarification" },
  { key: "public_pricing_grid", name: "Grille tarifaire publique", category: "Tarification" },
  { key: "savings_calculator", name: "Calcul d'économies par rapport à la moyenne", category: "Tarification" },

  // Outils pour réparateurs
  { key: "repairer_dashboard", name: "Tableau de bord réparateur complet", category: "Réparateur" },
  { key: "orders_management", name: "Gestion des commandes avec statuts", category: "Réparateur" },
  { key: "billing_system", name: "Système de facturation intégré", category: "Réparateur" },
  { key: "parts_inventory", name: "Gestion des stocks de pièces", category: "Réparateur" },
  { key: "repair_scheduling", name: "Planification des réparations", category: "Réparateur" },

  // Analyse et reporting
  { key: "performance_stats", name: "Statistiques de performance", category: "Analytics" },
  { key: "financial_reports", name: "Rapports financiers (CA, marge)", category: "Analytics" },
  { key: "business_dashboards", name: "Tableaux de bord métier", category: "Analytics" },
  { key: "detailed_analytics", name: "Analytics détaillé", category: "Analytics" },

  // Authentification et profils
  { key: "personal_spaces", name: "Espaces personnels clients et réparateurs", category: "Auth" },
  { key: "review_system", name: "Système de revues et notes", category: "Auth" },
  { key: "profiles_history", name: "Profils complets avec historique", category: "Auth" },

  // Communication
  { key: "realtime_notifications", name: "Système de notifications en temps réel", category: "Communication" },
  { key: "integrated_chat", name: "Chat intégré entre clients et réparateurs", category: "Communication" },
  { key: "automatic_reminders", name: "Rappels automatiques", category: "Communication" },
  { key: "client_support", name: "Support client", category: "Communication" },

  // Fonctionnalités marketplace
  { key: "parts_marketplace", name: "Marketplace de pièces détachées", category: "Marketplace" },
  { key: "ai_prediag", name: "Pré-diagnostic IA", category: "Marketplace" },
  { key: "time_slot_booking", name: "Prise de rendez-vous intelligente", category: "Marketplace" },
  { key: "notifications", name: "Notifications temps réel", category: "Marketplace" },
  { key: "analytics", name: "Rapports et analytics avancés", category: "Marketplace" },
  { key: "referral_program", name: "Programme de parrainage", category: "Marketplace" },
  { key: "billing_invoice", name: "Facturation intégrée", category: "Marketplace" },
  { key: "repair_tracking", name: "Suivi de réparation temps réel", category: "Marketplace" },

  // Fonctionnalités écologiques
  { key: "eco_score", name: "Score écologique des réparateurs", category: "Écologie" },
  { key: "carbon_impact", name: "Calcul d'impact carbone évité", category: "Écologie" },
  { key: "recycling_program", name: "Programme de recyclage des pièces", category: "Écologie" },
  { key: "eco_certifications", name: "Certifications environnementales", category: "Écologie" },
  { key: "green_parts", name: "Pièces reconditionnées et éco-responsables", category: "Écologie" },
  { key: "sustainability_reports", name: "Rapports de durabilité", category: "Écologie" },

  // Gamification et engagement
  { key: "badges_system", name: "Système de badges et récompenses", category: "Gamification" },
  { key: "monthly_rankings", name: "Classements mensuels des réparateurs", category: "Gamification" },
  { key: "community_challenges", name: "Défis communautaires", category: "Gamification" },
  { key: "ambassador_program", name: "Programme ambassadeur", category: "Gamification" },
  { key: "achievement_unlocks", name: "Déblocage de réalisations", category: "Gamification" },
  { key: "leaderboards", name: "Tableaux de classement interactifs", category: "Gamification" },
  { key: "reward_points", name: "Système de points récompense", category: "Gamification" },

  // Gestion multi-ateliers
  { key: "multi_workshop_management", name: "Gestion multi-ateliers", category: "Multi-Ateliers" },
  { key: "centralized_inventory", name: "Inventaire centralisé multi-sites", category: "Multi-Ateliers" },
  { key: "inter_workshop_transfers", name: "Transferts entre ateliers", category: "Multi-Ateliers" },
  { key: "unified_reporting", name: "Rapports unifiés multi-ateliers", category: "Multi-Ateliers" },
  { key: "workshop_performance", name: "Performance par atelier", category: "Multi-Ateliers" },
  { key: "resource_allocation", name: "Allocation des ressources inter-ateliers", category: "Multi-Ateliers" },
  { key: "franchise_management", name: "Gestion de franchise", category: "Multi-Ateliers" },

  // Analyse avancée
  { key: "predictive_analytics", name: "Analyse prédictive", category: "Analyse Avancée" },
  { key: "market_trends", name: "Tendances de marché en temps réel", category: "Analyse Avancée" },
  { key: "customer_behavior", name: "Analyse comportementale des clients", category: "Analyse Avancée" },
  { key: "demand_forecasting", name: "Prévision de la demande", category: "Analyse Avancée" },
  { key: "price_optimization", name: "Optimisation dynamique des prix", category: "Analyse Avancée" },
  { key: "competitive_analysis", name: "Analyse concurrentielle", category: "Analyse Avancée" },
  { key: "sentiment_analysis", name: "Analyse de sentiment des avis", category: "Analyse Avancée" },
  { key: "custom_dashboards", name: "Tableaux de bord personnalisables", category: "Analyse Avancée" },
  { key: "data_export", name: "Export de données avancé", category: "Analyse Avancée" },
  { key: "real_time_metrics", name: "Métriques en temps réel", category: "Analyse Avancée" },

  // Modules POS - Hub Central (€49.90/mois)
  { key: "pos_system_enabled", name: "Système POS complet", category: "Système POS" },
  { key: "pos_cash_register", name: "Caisse enregistreuse NF-525", category: "Système POS" },
  { key: "pos_inventory_sync", name: "Synchronisation inventaire temps réel", category: "Système POS" },
  { key: "pos_appointments_sync", name: "Synchronisation rendez-vous bidirectionnelle", category: "Système POS" },
  { key: "pos_repairs_management", name: "Gestion réparations centralisée", category: "Système POS" },
  { key: "pos_customer_database", name: "Base clients unifiée", category: "Système POS" },
  { key: "pos_billing_integration", name: "Facturation intégrée NF-525", category: "Système POS" },
  { key: "pos_offline_mode", name: "Mode hors ligne avec synchronisation", category: "Système POS" },
  { key: "pos_peripheral_support", name: "Support imprimantes et terminaux", category: "Système POS" },
  { key: "pos_dashboard_absorption", name: "Absorption fonctionnalités dashboard", category: "Système POS" },
  { key: "pos_data_migration", name: "Migration automatique des données", category: "Système POS" },

  // Modules E-commerce - Boutique en ligne (€89/mois)
  { key: "ecommerce_storefront", name: "Boutique en ligne personnalisée", category: "Plateforme E-commerce" },
  { key: "ecommerce_product_catalog", name: "Catalogue produits synchronisé", category: "Plateforme E-commerce" },
  { key: "ecommerce_order_management", name: "Gestion commandes e-commerce", category: "Plateforme E-commerce" },
  { key: "ecommerce_payment_integration", name: "Paiements en ligne Stripe", category: "Plateforme E-commerce" },
  { key: "ecommerce_seo_tools", name: "Outils SEO et marketing", category: "Plateforme E-commerce" },
  { key: "ecommerce_custom_domain", name: "Sous-domaine personnalisé", category: "Plateforme E-commerce" },
  { key: "ecommerce_analytics", name: "Analytics e-commerce avancées", category: "Plateforme E-commerce" },
  { key: "ecommerce_stock_sync", name: "Synchronisation stock POS/E-commerce", category: "Plateforme E-commerce" },
  { key: "ecommerce_customer_accounts", name: "Comptes clients e-commerce", category: "Plateforme E-commerce" },
  { key: "ecommerce_mobile_responsive", name: "Design mobile responsive", category: "Plateforme E-commerce" },

  // Module Rachat - Système de rachat d'appareils (€39/mois)
  { key: "buyback_enabled", name: "Module Rachat activé", category: "Module Rachat" },
  { key: "buyback_ai_evaluation", name: "Évaluation IA automatique", category: "Module Rachat" },
  { key: "buyback_price_grid", name: "Grille de prix dynamique", category: "Module Rachat" },
  { key: "buyback_inventory", name: "Gestion stocks rachetés", category: "Module Rachat" },
  { key: "buyback_revenue_tracking", name: "Suivi des revenus rachat", category: "Module Rachat" },
  { key: "buyback_client_interface", name: "Interface client dédiée", category: "Module Rachat" },
  { key: "buyback_condition_assessment", name: "Évaluation état des appareils", category: "Module Rachat" },
  { key: "buyback_market_price", name: "Prix marché temps réel", category: "Module Rachat" },

  // IA Diagnostic - Assistant IA Ben (Inclus dans tous les plans)
  { key: "ai_diagnostic_enabled", name: "Assistant IA Ben activé", category: "IA Diagnostic" },
  { key: "ai_diagnostic_chatbot", name: "Chatbot Ben personnalisé", category: "IA Diagnostic" },
  { key: "ai_diagnostic_prediag", name: "Pré-diagnostic automatique", category: "IA Diagnostic" },
  { key: "ai_diagnostic_knowledge", name: "Base de connaissances technique", category: "IA Diagnostic" },
  { key: "ai_diagnostic_suggestions", name: "Suggestions de réparation", category: "IA Diagnostic" },
  { key: "ai_diagnostic_history", name: "Historique des conversations", category: "IA Diagnostic" },
  { key: "ai_diagnostic_learning", name: "Apprentissage continu", category: "IA Diagnostic" },
  { key: "ai_diagnostic_multilang", name: "Support multilingue", category: "IA Diagnostic" },

  // Monitoring Business - Surveillance activité (Enterprise uniquement)
  { key: "monitoring_enabled", name: "Monitoring Business activé", category: "Monitoring Business" },
  { key: "monitoring_realtime", name: "Dashboard temps réel", category: "Monitoring Business" },
  { key: "monitoring_alerts", name: "Alertes personnalisées", category: "Monitoring Business" },
  { key: "monitoring_metrics", name: "Métriques business avancées", category: "Monitoring Business" },
  { key: "monitoring_predictions", name: "Analyses prédictives", category: "Monitoring Business" },
  { key: "monitoring_reports", name: "Rapports automatiques", category: "Monitoring Business" },
  { key: "monitoring_performance", name: "Suivi performance 24/7", category: "Monitoring Business" },
  { key: "monitoring_notifications", name: "Notifications intelligentes", category: "Monitoring Business" },

  // Publicité IA - Gestion automatisée de la publicité (€79/mois)
  { key: "advertising_enabled", name: "Publicité IA activée", category: "Publicité IA" },
  { key: "advertising_campaigns", name: "Campagnes automatisées", category: "Publicité IA" },
  { key: "advertising_targeting", name: "Ciblage intelligent", category: "Publicité IA" },
  { key: "advertising_optimization", name: "Optimisation auto des enchères", category: "Publicité IA" },
  { key: "advertising_analytics", name: "Analytics publicitaires", category: "Publicité IA" },
  { key: "advertising_keywords", name: "Recherche mots-clés IA", category: "Publicité IA" },
  { key: "advertising_creative", name: "Création automatique d'annonces", category: "Publicité IA" },
  { key: "advertising_budget", name: "Gestion budget intelligente", category: "Publicité IA" }
];

/**
 * Groupe les fonctionnalités par catégorie
 */
export const getFeaturesByCategory = (): Record<string, Feature[]> => {
  return FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);
};
