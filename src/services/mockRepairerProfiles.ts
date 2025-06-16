
import { RepairerProfile, REPAIR_TYPES } from '@/types/repairerProfile';

// Profils mockés pour les réparateurs de test
export const getMockProfile = (repairerId: string): RepairerProfile | null => {
  const mockProfiles: Record<string, RepairerProfile> = {
    'test-repairer-001': {
      id: 'mock-profile-001',
      repairer_id: 'test-repairer-001',
      business_name: 'TechRepair Pro',
      siret_number: '12345678901234',
      description: 'Spécialiste en réparation de smartphones et tablettes avec plus de 10 ans d\'expérience. Nous utilisons uniquement des pièces de qualité et offrons une garantie de 6 mois sur toutes nos réparations.',
      address: '123 Rue de la République',
      city: 'Paris',
      postal_code: '75001',
      phone: '+33 1 23 45 67 89',
      email: 'tech@repair.fr',
      website: 'https://techrepair-pro.fr',
      facebook_url: 'https://facebook.com/techrepairpro',
      instagram_url: 'https://instagram.com/techrepairpro',
      linkedin_url: null,
      twitter_url: null,
      whatsapp_url: 'https://wa.me/33123456789',
      telegram_url: null,
      tiktok_url: null,
      has_qualirepar_label: true,
      repair_types: ['telephone', 'ordinateur'],
      profile_image_url: null,
      created_at: '2023-01-15T10:00:00Z',
      updated_at: '2024-12-15T10:00:00Z'
    },
    'test-repairer-002': {
      id: 'mock-profile-002',
      repairer_id: 'test-repairer-002',
      business_name: 'Mobile Fix Express',
      siret_number: '98765432109876',
      description: 'Réparation rapide de mobiles et accessoires. Service express en moins de 2h pour la plupart des pannes courantes.',
      address: '456 Avenue des Lumières',
      city: 'Lyon',
      postal_code: '69001',
      phone: '+33 1 98 76 54 32',
      email: 'contact@mobilefix.fr',
      website: 'https://mobilefix-express.fr',
      facebook_url: null,
      instagram_url: 'https://instagram.com/mobilefixexpress',
      linkedin_url: 'https://linkedin.com/company/mobilefixexpress',
      twitter_url: null,
      whatsapp_url: null,
      telegram_url: 'https://t.me/mobilefixexpress',
      tiktok_url: null,
      has_qualirepar_label: false,
      repair_types: ['telephone', 'montre'],
      profile_image_url: null,
      created_at: '2023-02-20T14:30:00Z',
      updated_at: '2024-12-15T10:00:00Z'
    },
    'test-repairer-003': {
      id: 'mock-profile-003',
      repairer_id: 'test-repairer-003',
      business_name: 'Smartphone Clinic',
      siret_number: null,
      description: 'Clinique spécialisée dans le diagnostic et la réparation de smartphones. Devis gratuit et transparent.',
      address: '789 Boulevard du Port',
      city: 'Marseille',
      postal_code: '13001',
      phone: '+33 1 11 22 33 44',
      email: 'info@smartphoneclinic.fr',
      website: null,
      facebook_url: 'https://facebook.com/smartphoneclinic',
      instagram_url: null,
      linkedin_url: null,
      twitter_url: null,
      whatsapp_url: null,
      telegram_url: null,
      tiktok_url: 'https://tiktok.com/@smartphoneclinic',
      has_qualirepar_label: false,
      repair_types: ['telephone', 'autres'],
      profile_image_url: null,
      created_at: '2023-03-10T09:15:00Z',
      updated_at: '2024-12-15T10:00:00Z'
    }
  };

  return mockProfiles[repairerId] || null;
};

export const getRepairTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    telephone: 'Téléphone',
    montre: 'Montre',
    console: 'Console',
    ordinateur: 'Ordinateur',
    autres: 'Autres'
  };
  return labels[type] || type;
};
