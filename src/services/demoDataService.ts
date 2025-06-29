
import { Repairer } from '@/types/repairer';

/**
 * Service pour gérer les données de démonstration
 */
export class DemoDataService {
  /**
   * Données de démonstration pour les réparateurs
   */
  static getDemoRepairers(): Repairer[] {
    return [
      {
        id: 'demo-repairer-1',
        name: 'TechFix Pro - Démo',
        address: '123 Rue de la Réparation',
        postal_code: '75001',
        city: 'Paris',
        lat: 48.8566,
        lng: 2.3522,
        phone: '+33 1 23 45 67 89',
        email: 'demo@techfix.fr',
        rating: 4.8,
        review_count: 127,
        specialties: ['Téléphone', 'Tablette', 'Ordinateur'],
        services: ['Réparation express', 'Récupération de données', 'Devis gratuit'],
        price_range: 'medium',
        response_time: '< 2h',
        is_open: true,
        opening_hours: {
          lundi: '09:00-18:00',
          mardi: '09:00-18:00',
          mercredi: '09:00-18:00',
          jeudi: '09:00-18:00',
          vendredi: '09:00-18:00',
          samedi: '10:00-16:00',
          dimanche: 'Fermé'
        },
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_verified: true,
        website: 'https://demo-techfix.fr',
        business_status: 'active',
        pappers_verified: true,
        pappers_last_check: new Date().toISOString(),
        siret: '12345678901234',
        siren: '123456789',
        region: 'Île-de-France',
        department: '75'
      },
      {
        id: 'demo-repairer-2',
        name: 'Smartphone Clinic - Démo',
        address: '456 Avenue des Mobiles',
        postal_code: '69001',
        city: 'Lyon',
        lat: 45.7640,
        lng: 4.8357,
        phone: '+33 4 78 90 12 34',
        email: 'demo@smartphone-clinic.fr',
        rating: 4.6,
        review_count: 89,
        specialties: ['Téléphone', 'Montre connectée'],
        services: ['Réparation sur place', 'Remplacement écran', 'Changement batterie'],
        price_range: 'low',
        response_time: '< 1h',
        is_open: true,
        opening_hours: {
          lundi: '08:00-19:00',
          mardi: '08:00-19:00',
          mercredi: '08:00-19:00',
          jeudi: '08:00-19:00',
          vendredi: '08:00-19:00',
          samedi: '09:00-17:00',
          dimanche: 'Fermé'
        },
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_verified: true,
        website: 'https://demo-smartphone-clinic.fr',
        business_status: 'active',
        pappers_verified: true,
        pappers_last_check: new Date().toISOString(),
        siret: '98765432109876',
        siren: '987654321',
        region: 'Auvergne-Rhône-Alpes',
        department: '69'
      }
    ];
  }

  /**
   * Combine les données réelles avec les données de démo si le mode démo est activé
   */
  static combineWithDemoData<T extends { id: string; source?: string }>(
    realData: T[],
    demoData: T[],
    demoModeEnabled: boolean
  ): T[] {
    if (!demoModeEnabled) {
      // Mode démo désactivé : retourner uniquement les vraies données
      return realData.filter(item => item.source !== 'demo');
    }

    // Mode démo activé : combiner les données réelles (non-démo) avec les données de démo
    const realNonDemoData = realData.filter(item => item.source !== 'demo');
    return [...realNonDemoData, ...demoData];
  }

  /**
   * Filtre les données selon le mode démo
   */
  static filterDataByDemoMode<T extends { source?: string }>(
    data: T[],
    demoModeEnabled: boolean
  ): T[] {
    if (!demoModeEnabled) {
      // Mode démo désactivé : exclure les données de démo
      return data.filter(item => item.source !== 'demo');
    }
    // Mode démo activé : inclure toutes les données
    return data;
  }
}

