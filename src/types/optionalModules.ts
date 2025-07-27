export interface OptionalModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  pricing: {
    monthly: number;
    yearly: number;
  };
  availableForPlans: string[];
  category: string;
  features: string[];
  newFeatures?: string[];
  color: string;
}

export const OPTIONAL_MODULES: OptionalModule[] = [
  {
    id: 'pos',
    name: 'POS Avancé',
    description: 'Point de vente complet avec gestion NF-525, archivage automatique et conformité fiscale',
    icon: 'Smartphone',
    isActive: true,
    pricing: {
      monthly: 49.90,
      yearly: 499.00
    },
    availableForPlans: ['premium', 'enterprise'],
    category: 'Système POS',
    features: [
      'Interface POS tactile',
      'Archivage automatique NF-525',
      'Gestion des sessions',
      'Tickets conformes',
      'Synchronisation temps réel'
    ],
    newFeatures: ['Archivage NF-525', 'Hash d\'intégrité', 'Audit complet'],
    color: 'blue'
  },
  {
    id: 'ecommerce',
    name: 'Module E-commerce',
    description: 'Boutique en ligne complète avec gestion des commandes et paiements intégrés',
    icon: 'ShoppingCart',
    isActive: true,
    pricing: {
      monthly: 89.00,
      yearly: 890.00
    },
    availableForPlans: ['premium', 'enterprise'],
    category: 'Plateforme E-commerce',
    features: [
      'Boutique en ligne personnalisée',
      'Catalogue produits synchronisé',
      'Paiements en ligne Stripe',
      'Gestion commandes',
      'Analytics e-commerce'
    ],
    newFeatures: ['Synchronisation POS', 'SEO intégré', 'Mobile responsive'],
    color: 'blue'
  },
  {
    id: 'buyback',
    name: 'Module Rachat',
    description: 'Système de rachat d\'appareils avec évaluation IA et gestion complète des stocks',
    icon: 'Euro',
    isActive: true,
    pricing: {
      monthly: 39.00,
      yearly: 390.00
    },
    availableForPlans: ['premium', 'enterprise'],
    category: 'Module Rachat',
    features: [
      'Évaluation IA automatique',
      'Grille de prix dynamique',
      'Gestion des stocks rachetés',
      'Suivi des revenus',
      'Interface client dédiée'
    ],
    newFeatures: ['IA d\'évaluation', 'Prix dynamiques', 'Stats avancées'],
    color: 'green'
  },
  {
    id: 'ai_diagnostic',
    name: 'IA Diagnostic',
    description: 'Assistant IA pour le pré-diagnostic et l\'aide à la réparation avec Ben',
    icon: 'Brain',
    isActive: true,
    pricing: {
      monthly: 0,
      yearly: 0
    },
    availableForPlans: ['basic', 'premium', 'enterprise'],
    category: 'IA Diagnostic',
    features: [
      'Chatbot Ben personnalisé',
      'Pré-diagnostic automatique',
      'Base de connaissances',
      'Suggestions de réparation',
      'Historique des conversations'
    ],
    newFeatures: ['Assistant Ben', 'Diagnostic avancé', 'Apprentissage continu'],
    color: 'purple'
  },
  {
    id: 'monitoring',
    name: 'Monitoring Business',
    description: 'Surveillance en temps réel de votre activité avec alertes intelligentes',
    icon: 'TrendingUp',
    isActive: true,
    pricing: {
      monthly: 0,
      yearly: 0
    },
    availableForPlans: ['enterprise'],
    category: 'Monitoring Business',
    features: [
      'Dashboard temps réel',
      'Alertes personnalisées',
      'Métriques business',
      'Analyses prédictives',
      'Rapports automatiques'
    ],
    newFeatures: ['Alertes intelligentes', 'Prédictions IA', 'Monitoring 24/7'],
    color: 'orange'
  },
  {
    id: 'advertising',
    name: 'Publicité IA',
    description: 'Gestion automatisée de vos campagnes publicitaires avec IA',
    icon: 'Megaphone',
    isActive: true,
    pricing: {
      monthly: 79.00,
      yearly: 790.00
    },
    availableForPlans: ['premium', 'enterprise'],
    category: 'Publicité IA',
    features: [
      'Campagnes automatisées',
      'Ciblage intelligent',
      'Optimisation auto enchères',
      'Analytics publicitaires',
      'Création annonces IA'
    ],
    newFeatures: ['IA prédictive', 'Ciblage avancé', 'ROI optimisé'],
    color: 'red'
  }
];