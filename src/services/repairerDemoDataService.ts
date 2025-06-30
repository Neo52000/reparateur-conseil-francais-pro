
import { useDemoMode } from '@/hooks/useDemoMode';

/**
 * Service pour les données de démonstration du tableau de bord réparateur
 */
export class RepairerDemoDataService {
  /**
   * Données de démonstration pour les commandes
   */
  static getDemoOrders() {
    return [
      {
        id: 'demo-order-1',
        client: 'Jean Dupont (Démo)',
        device: 'iPhone 14 Pro',
        issue: 'Écran cassé',
        status: 'En cours',
        priority: 'Urgente',
        estimatedPrice: 180,
        source: 'demo'
      },
      {
        id: 'demo-order-2',
        client: 'Marie Martin (Démo)',
        device: 'Samsung Galaxy S23',
        issue: 'Batterie défaillante',
        status: 'Diagnostic',
        priority: 'Normale',
        estimatedPrice: 85,
        source: 'demo'
      },
      {
        id: 'demo-order-3',
        client: 'Pierre Durand (Démo)',
        device: 'iPad Air',
        issue: 'Problème de charge',
        status: 'Terminé',
        priority: 'Normale',
        estimatedPrice: 120,
        source: 'demo'
      }
    ];
  }

  /**
   * Données de démonstration pour l'inventaire
   */
  static getDemoInventory() {
    return [
      {
        id: 'demo-inventory-1',
        part: 'Écran iPhone 14 Pro',
        stock: 5,
        minStock: 2,
        price: 150,
        source: 'demo'
      },
      {
        id: 'demo-inventory-2',
        part: 'Batterie Samsung S23',
        stock: 1,
        minStock: 3,
        price: 65,
        source: 'demo'
      },
      {
        id: 'demo-inventory-3',
        part: 'Connecteur Lightning',
        stock: 0,
        minStock: 5,
        price: 25,
        source: 'demo'
      },
      {
        id: 'demo-inventory-4',
        part: 'Écran iPad Air',
        stock: 8,
        minStock: 2,
        price: 200,
        source: 'demo'
      }
    ];
  }

  /**
   * Données de démonstration pour les rendez-vous
   */
  static getDemoAppointments() {
    return [
      {
        id: 'demo-appointment-1',
        client: 'Paul Durand (Démo)',
        time: '14:00',
        service: 'Diagnostic iPhone',
        phone: '+33 6 12 34 56 78',
        source: 'demo'
      },
      {
        id: 'demo-appointment-2',
        client: 'Sophie Legrand (Démo)',
        time: '16:30',
        service: 'Réparation écran',
        phone: '+33 6 98 76 54 32',
        source: 'demo'
      },
      {
        id: 'demo-appointment-3',
        client: 'Thomas Rousseau (Démo)',
        time: '10:00',
        service: 'Changement batterie',
        phone: '+33 6 11 22 33 44',
        source: 'demo'
      }
    ];
  }

  /**
   * Statistiques de démonstration
   */
  static getDemoStats() {
    return {
      monthlyRevenue: 3450,
      pendingOrders: 8,
      completedThisMonth: 24,
      avgRepairTime: 2.5,
      source: 'demo'
    };
  }

  /**
   * Filtre les données selon le mode démo
   */
  static filterDataByDemoMode<T extends { source?: string }>(
    realData: T[],
    demoData: T[],
    demoModeEnabled: boolean
  ): T[] {
    console.log('🎯 RepairerDemoDataService - Mode démo:', demoModeEnabled);
    console.log('📊 Données réelles:', realData.length);
    console.log('🎭 Données démo:', demoData.length);

    if (demoModeEnabled) {
      // Mode démo ACTIVÉ : mélanger données réelles (non-démo) + données démo
      const filteredRealData = realData.filter(item => !item.source || item.source !== 'demo');
      const combinedData = [...filteredRealData, ...demoData];
      console.log('✅ Mode démo activé - Données combinées:', combinedData.length);
      return combinedData;
    } else {
      // Mode démo DÉSACTIVÉ : UNIQUEMENT les données réelles (exclure toute donnée de démo)
      const filteredRealData = realData.filter(item => !item.source || item.source !== 'demo');
      console.log('🚫 Mode démo désactivé - Données réelles uniquement:', filteredRealData.length);
      return filteredRealData;
    }
  }

  /**
   * Combine les statistiques selon le mode démo
   */
  static getStatsForDemoMode(realStats: any, demoModeEnabled: boolean) {
    console.log('📈 Stats - Mode démo:', demoModeEnabled);
    if (demoModeEnabled) {
      const demoStats = this.getDemoStats();
      console.log('✅ Retour des stats de démo:', demoStats);
      return demoStats;
    }
    console.log('🚫 Retour des vraies stats:', realStats);
    return realStats;
  }
}

/**
 * Hook pour utiliser les données du tableau de bord réparateur avec contrôle du mode démo
 */
export const useRepairerDashboardData = () => {
  const { demoModeEnabled } = useDemoMode();

  const getFilteredOrders = (realOrders: any[]) => {
    const demoOrders = RepairerDemoDataService.getDemoOrders();
    return RepairerDemoDataService.filterDataByDemoMode(realOrders, demoOrders, demoModeEnabled);
  };

  const getFilteredInventory = (realInventory: any[]) => {
    const demoInventory = RepairerDemoDataService.getDemoInventory();
    return RepairerDemoDataService.filterDataByDemoMode(realInventory, demoInventory, demoModeEnabled);
  };

  const getFilteredAppointments = (realAppointments: any[]) => {
    const demoAppointments = RepairerDemoDataService.getDemoAppointments();
    return RepairerDemoDataService.filterDataByDemoMode(realAppointments, demoAppointments, demoModeEnabled);
  };

  const getFilteredStats = (realStats: any) => {
    return RepairerDemoDataService.getStatsForDemoMode(realStats, demoModeEnabled);
  };

  return {
    demoModeEnabled,
    getFilteredOrders,
    getFilteredInventory,
    getFilteredAppointments,
    getFilteredStats
  };
};
