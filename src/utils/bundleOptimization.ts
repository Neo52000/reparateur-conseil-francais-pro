/**
 * Utilitaires d'optimisation pour le bundle de production
 */

// Lazy loading pour les gros composants
export const LazyComponents = {
  AdminDashboard: () => import('@/components/AdminDashboard'),
  RepairerDashboard: () => import('@/components/repairer-dashboard/RepairerDashboard'),
  BlogAdmin: () => import('@/components/blog/admin/BlogAdmin'),
  AdvancedAdvertisingDashboard: () => import('@/components/advertising/AdvancedAdvertisingDashboard'),
  RepairersMap: () => import('@/components/RepairersMap'),
  AdvancedSearch: () => import('@/components/AdvancedSearch'),
  ScrapingControl: () => import('@/components/ScrapingControl'),
  ChatInterface: () => import('@/components/ChatInterface'),
};

// Pre-loading stratégique des composants critiques
export const preloadCriticalComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload des composants utilisés dans les 3 premières secondes
    setTimeout(() => {
      LazyComponents.RepairersMap();
    }, 1000);
    
    setTimeout(() => {
      LazyComponents.AdvancedSearch();
    }, 2000);
  }
};

// Code splitting par rôle utilisateur
export const RoleBasedComponents = {
  admin: [
    'AdminDashboard',
    'BlogAdmin', 
    'AdvancedAdvertisingDashboard',
    'ScrapingControl'
  ],
  repairer: [
    'RepairerDashboard'
  ],
  client: [
    'RepairersMap',
    'AdvancedSearch',
    'ChatInterface'
  ]
};

// Optimisation des imports conditionnels
export const conditionalImport = async (componentName: keyof typeof LazyComponents, userRole?: string) => {
  // Vérifier si le composant est nécessaire pour ce rôle
  if (userRole && RoleBasedComponents[userRole as keyof typeof RoleBasedComponents]) {
    const allowedComponents = RoleBasedComponents[userRole as keyof typeof RoleBasedComponents];
    if (!allowedComponents.includes(componentName)) {
      return null;
    }
  }
  
  return await LazyComponents[componentName]();
};

// Tree shaking pour les utilitaires
export const TreeShakingHelpers = {
  // Importer seulement les utilitaires nécessaires
  loadValidationUtils: () => import('@/utils/validation'),
  loadPerformanceUtils: () => import('@/utils/performance'),
  loadErrorHandling: () => import('@/utils/errorHandling'),
};

// Bundle analyzer helpers pour le développement
export const BundleAnalyzer = {
  logComponentSizes: () => {
    if (import.meta.env.DEV) {
      console.group('📦 Bundle Analysis');
      console.log('Large components detected:', Object.keys(LazyComponents));
      console.log('Role-based splitting:', RoleBasedComponents);
      console.groupEnd();
    }
  },
  
  measureLoadTime: (componentName: string, startTime: number) => {
    if (import.meta.env.DEV) {
      const loadTime = performance.now() - startTime;
      console.log(`⏱️ ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }
  }
};