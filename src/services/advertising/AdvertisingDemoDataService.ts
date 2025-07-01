
import { useDemoMode } from '@/hooks/useDemoMode';

/**
 * Service pour les données de démonstration du module publicitaire
 */
export class AdvertisingDemoDataService {
  /**
   * Données de démonstration pour les métriques temps réel
   */
  static getDemoRealTimeData() {
    return {
      totalImpressions: 145000,
      totalClicks: 4350,
      totalConversions: 218,
      totalRevenue: 18900,
      ctr: 3.0,
      conversionRate: 5.01,
      costPerClick: 2.08,
      roi: 310
    };
  }

  /**
   * Données de démonstration pour la performance par segment
   */
  static getDemoSegmentPerformance() {
    return [
      {
        name: 'Clients Premium Lyon (Démo)',
        ctr: 4.8,
        conversionRate: 7.2,
        roi: 385,
        trend: 'up',
        change: '+18%',
        status: 'excellent'
      },
      {
        name: 'Réparateurs Paris (Démo)',
        ctr: 4.1,
        conversionRate: 6.1,
        roi: 298,
        trend: 'up',
        change: '+12%',
        status: 'excellent'
      },
      {
        name: 'iOS Premium 25-35 ans (Démo)',
        ctr: 5.7,
        conversionRate: 8.9,
        roi: 450,
        trend: 'up',
        change: '+25%',
        status: 'excellent'
      },
      {
        name: 'Nouveaux utilisateurs (Démo)',
        ctr: 2.8,
        conversionRate: 3.5,
        roi: 165,
        trend: 'stable',
        change: '±3%',
        status: 'average'
      }
    ];
  }

  /**
   * Combine les données réelles avec les données de démo selon le mode démo
   */
  static getAnalyticsData(realData: any, demoModeEnabled: boolean) {
    console.log('📊 AdvertisingDemoDataService - Mode démo:', demoModeEnabled);
    
    if (demoModeEnabled) {
      console.log('🎭 Mode démo activé - Utilisation des données enrichies');
      return {
        realTimeData: this.getDemoRealTimeData(),
        segmentPerformance: this.getDemoSegmentPerformance()
      };
    } else {
      console.log('📈 Mode production - Utilisation des données réelles');
      return {
        realTimeData: realData.realTimeData || {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          ctr: 0,
          conversionRate: 0,
          costPerClick: 0,
          roi: 0
        },
        segmentPerformance: realData.segmentPerformance || []
      };
    }
  }

  /**
   * Filtre les données selon le mode démo
   */
  static filterDataByDemoMode<T extends { source?: string }>(
    realData: T[],
    demoData: T[],
    demoModeEnabled: boolean
  ): T[] {
    console.log('🔍 AdvertisingDemoDataService - Filtrage mode démo:', demoModeEnabled);
    
    if (demoModeEnabled) {
      // Mode démo activé : données réelles + données démo
      const filteredRealData = realData.filter(item => !item.source || item.source !== 'demo');
      const combinedData = [...filteredRealData, ...demoData];
      console.log('✅ Mode démo activé - Données combinées:', combinedData.length);
      return combinedData;
    } else {
      // Mode démo désactivé : UNIQUEMENT les données réelles
      const filteredRealData = realData.filter(item => !item.source || item.source !== 'demo');
      console.log('🚫 Mode démo désactivé - Données réelles uniquement:', filteredRealData.length);
      return filteredRealData;
    }
  }
}

/**
 * Hook pour utiliser les données publicitaires avec contrôle du mode démo
 */
export const useAdvertisingDashboardData = () => {
  const { demoModeEnabled } = useDemoMode();

  const getAnalyticsData = (realData: any) => {
    return AdvertisingDemoDataService.getAnalyticsData(realData, demoModeEnabled);
  };

  const filterCampaignData = (realCampaigns: any[], demoCampaigns: any[]) => {
    return AdvertisingDemoDataService.filterDataByDemoMode(realCampaigns, demoCampaigns, demoModeEnabled);
  };

  return {
    demoModeEnabled,
    getAnalyticsData,
    filterCampaignData
  };
};
