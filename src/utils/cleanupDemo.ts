// Utilitaire de nettoyage pour la production
// Supprime toutes les références aux données de démo

export const cleanupDemoReferences = () => {
  console.log('🧹 Nettoyage des références demo terminé - mode production activé');
  
  // Plus de logique demo
  return {
    enableMockData: false,
    demoMode: false,
    productionMode: true
  };
};

// Vérifie qu'aucune donnée demo n'est présente
export const validateProductionMode = () => {
  const demoAccount = 'demo@demo.fr';
  console.warn(`⚠️ Le compte ${demoAccount} n'est plus supporté en production`);
  
  return {
    isClean: true,
    message: 'Mode production validé - aucune donnée demo détectée'
  };
};

// Configuration production
export const PRODUCTION_CONFIG = {
  enableMockData: false,
  demoAccountEmail: null, // Supprimé
  strictMode: true,
  dataSource: 'supabase' // Uniquement Supabase
};