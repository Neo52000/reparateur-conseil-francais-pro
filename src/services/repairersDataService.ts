
import { supabase } from '@/integrations/supabase/client';

export interface RepairerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  subscription_tier: string;
  subscribed: boolean;
  total_repairs: number;
  rating: number;
  created_at: string;
}

export const fetchRepairersData = async (): Promise<RepairerData[]> => {
  // Récupérer les réparateurs depuis la base de données
  const { data: repairersData, error: repairersError } = await supabase
    .from('repairers')
    .select('*')
    .order('created_at', { ascending: false });

  if (repairersError) throw repairersError;

  // Récupérer les abonnements existants pour faire la liaison
  const { data: subscriptionsData, error: subscriptionsError } = await supabase
    .from('repairer_subscriptions')
    .select('*');

  if (subscriptionsError) {
    console.error('Error fetching subscriptions for repairers:', subscriptionsError);
  }

  return processRepairersData(repairersData || [], subscriptionsData || []);
};

const processRepairersData = async (repairersData: any[], subscriptionsData: any[]): Promise<RepairerData[]> => {
  // Convertir les données pour correspondre à l'interface RepairerData
  const processedRepairers: RepairerData[] = repairersData.map((repairer) => {
    // Chercher un abonnement correspondant basé sur l'email
    const subscription = subscriptionsData.find(sub => sub.email === repairer.email);
    
    return {
      id: repairer.id,
      name: repairer.name,
      email: repairer.email || 'Non renseigné',
      phone: repairer.phone || 'Non renseigné',
      city: repairer.city,
      subscription_tier: subscription?.subscription_tier || 'free',
      subscribed: subscription?.subscribed || false,
      total_repairs: Math.floor(Math.random() * 200), // Données simulées pour l'instant
      rating: repairer.rating || 4.5,
      created_at: repairer.created_at
    };
  });

  // Créer automatiquement des abonnements gratuits pour les réparateurs sans abonnement
  await createMissingFreeSubscriptions(repairersData, subscriptionsData);

  return processedRepairers;
};

const createMissingFreeSubscriptions = async (repairersData: any[], subscriptionsData: any[]) => {
  for (const repairer of repairersData) {
    if (repairer.email && !subscriptionsData.find(sub => sub.email === repairer.email)) {
      console.log('Creating free subscription for repairer:', repairer.email);
      
      // Créer un abonnement gratuit pour ce réparateur
      const { error: insertError } = await supabase
        .from('repairer_subscriptions')
        .insert({
          email: repairer.email,
          repairer_id: repairer.id,
          subscription_tier: 'free',
          subscribed: true,
          billing_cycle: 'monthly'
        });

      if (insertError) {
        console.error('Error creating free subscription:', insertError);
      }
    }
  }
};

export const getMockRepairersData = (): RepairerData[] => {
  return [
    {
      id: 'test-repairer-001',
      name: 'TechRepair Pro',
      email: 'tech@repair.fr',
      phone: '+33 1 23 45 67 89',
      city: 'Paris',
      subscription_tier: 'premium',
      subscribed: true,
      total_repairs: 156,
      rating: 4.9,
      created_at: '2023-01-15T10:00:00Z'
    },
    {
      id: 'test-repairer-002',
      name: 'Mobile Fix Express',
      email: 'contact@mobilefix.fr',
      phone: '+33 1 98 76 54 32',
      city: 'Lyon',
      subscription_tier: 'basic',
      subscribed: true,
      total_repairs: 89,
      rating: 4.5,
      created_at: '2023-02-20T14:30:00Z'
    },
    {
      id: 'test-repairer-003',
      name: 'Smartphone Clinic',
      email: 'info@smartphoneclinic.fr',
      phone: '+33 1 11 22 33 44',
      city: 'Marseille',
      subscription_tier: 'free',
      subscribed: false,
      total_repairs: 23,
      rating: 4.2,
      created_at: '2023-03-10T09:15:00Z'
    }
  ];
};
