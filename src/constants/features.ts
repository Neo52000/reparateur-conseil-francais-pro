
export interface Feature {
  key: string;
  name: string;
  description: string;
  category: 'subscription' | 'system' | 'blog' | 'analytics';
  planRestriction?: string[];
}

// Définir les plans disponibles (non readonly pour compatibilité)
export const PLANS = ['Gratuit', 'Basique', 'Premium', 'Enterprise'] as const;
export type PlanName = typeof PLANS[number];

export const FEATURES: Feature[] = [
  // Existing subscription features
  {
    key: 'multiple_photos',
    name: 'Photos multiples',
    description: 'Ajout de plusieurs photos sur le profil',
    category: 'subscription',
    planRestriction: ['Premium', 'Enterprise']
  },
  {
    key: 'premium_badge',
    name: 'Badge Premium',
    description: 'Badge distinctif sur le profil',
    category: 'subscription',
    planRestriction: ['Premium', 'Enterprise']
  },
  {
    key: 'priority_listing',
    name: 'Référencement prioritaire',
    description: 'Apparition en haut des résultats de recherche',
    category: 'subscription',
    planRestriction: ['Enterprise']
  },
  {
    key: 'advanced_analytics',
    name: 'Analytics avancées',
    description: 'Statistiques détaillées de performance',
    category: 'analytics',
    planRestriction: ['Enterprise']
  },
  {
    key: 'custom_pricing',
    name: 'Tarification personnalisée',
    description: 'Définition de tarifs personnalisés par réparation',
    category: 'subscription',
    planRestriction: ['Premium', 'Enterprise']
  },
  {
    key: 'bulk_operations',
    name: 'Opérations en lot',
    description: 'Modification de plusieurs tarifs simultanément',
    category: 'subscription',
    planRestriction: ['Enterprise']
  },
  {
    key: 'api_access',
    name: 'Accès API',
    description: 'Intégration avec systèmes externes',
    category: 'subscription',
    planRestriction: ['Enterprise']
  },
  
  // System features
  {
    key: 'demo_mode',
    name: 'Mode démo',
    description: 'Permet aux administrateurs d\'utiliser un compte de démonstration',
    category: 'system'
  },
  {
    key: 'scraping_system',
    name: 'Système de scraping',
    description: 'Collecte automatique de données de réparateurs',
    category: 'system'
  },
  {
    key: 'ai_classification',
    name: 'Classification IA',
    description: 'Classification automatique des réparateurs par IA',
    category: 'system'
  },
  
  // New blog features
  {
    key: 'blog_access_public',
    name: 'Blog public',
    description: 'Accès aux articles de blog publics',
    category: 'blog'
  },
  {
    key: 'blog_access_repairers',
    name: 'Blog réparateurs',
    description: 'Accès aux articles de blog destinés aux réparateurs',
    category: 'blog',
    planRestriction: ['Gratuit', 'Premium', 'Enterprise']
  },
  {
    key: 'blog_advanced_repairers',
    name: 'Blog réparateurs avancé',
    description: 'Accès aux articles techniques avancés pour réparateurs',
    category: 'blog',
    planRestriction: ['Premium', 'Enterprise']
  },
  {
    key: 'blog_ai_generation',
    name: 'Génération IA d\'articles',
    description: 'Génération automatique d\'articles de blog par IA',
    category: 'blog'
  },
  {
    key: 'blog_scheduling',
    name: 'Planification d\'articles',
    description: 'Publication programmée d\'articles de blog',
    category: 'blog'
  },
  {
    key: 'blog_comments',
    name: 'Commentaires blog',
    description: 'Système de commentaires sur les articles',
    category: 'blog'
  },
  {
    key: 'blog_newsletter',
    name: 'Newsletter',
    description: 'Abonnement newsletter pour les articles de blog',
    category: 'blog'
  },
  {
    key: 'blog_analytics',
    name: 'Analytics blog',
    description: 'Statistiques détaillées des articles de blog',
    category: 'blog',
    planRestriction: ['Premium', 'Enterprise']
  },
  {
    key: 'blog_seo_optimization',
    name: 'Optimisation SEO blog',
    description: 'Optimisation automatique SEO des articles',
    category: 'blog'
  },
  {
    key: 'blog_social_sharing',
    name: 'Partage social',
    description: 'Boutons de partage sur réseaux sociaux',
    category: 'blog'
  }
];

export const FEATURE_CATEGORIES = {
  subscription: 'Abonnement',
  system: 'Système',
  blog: 'Blog',
  analytics: 'Analytics'
} as const;

export const getFeaturesByCategory = (category?: keyof typeof FEATURE_CATEGORIES) => {
  if (!category) {
    // Retourner les features groupées par catégorie
    const grouped: Record<string, Feature[]> = {};
    for (const feature of FEATURES) {
      const categoryName = FEATURE_CATEGORIES[feature.category];
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(feature);
    }
    return grouped;
  }
  
  return FEATURES.filter(feature => feature.category === category);
};

export const getFeaturesByPlan = (planName: string) => {
  return FEATURES.filter(feature => 
    !feature.planRestriction || feature.planRestriction.includes(planName)
  );
};

export const isFeatureAvailable = (featureKey: string, planName: string) => {
  const feature = FEATURES.find(f => f.key === featureKey);
  if (!feature) return false;
  
  return !feature.planRestriction || feature.planRestriction.includes(planName);
};
