import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LoyaltyProgram {
  id: string;
  repairer_id: string;
  program_name: string;
  points_per_euro: number;
  welcome_bonus: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyPoints {
  id: string;
  repairer_id: string;
  customer_id: string;
  customer_email: string;
  customer_name?: string;
  total_points: number;
  lifetime_points: number;
  tier_level: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  repairer_id: string;
  customer_id: string;
  transaction_type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  points_amount: number;
  description?: string;
  order_reference?: string;
  created_at: string;
}

export const useBusinessModules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<LoyaltyPoints[]>([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);

  // Charger le programme de fidélité
  const fetchLoyaltyProgram = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('loyalty_program')
        .select('*')
        .eq('repairer_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setLoyaltyProgram(data);
    } catch (error) {
      console.error('Error fetching loyalty program:', error);
    }
  };

  // Charger les clients fidélité
  const fetchLoyaltyCustomers = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('repairer_id', user.id)
        .order('total_points', { ascending: false });

      if (error) throw error;
      setLoyaltyCustomers(data || []);
    } catch (error) {
      console.error('Error fetching loyalty customers:', error);
    }
  };

  // Charger les transactions de fidélité
  const fetchLoyaltyTransactions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLoyaltyTransactions((data || []) as LoyaltyTransaction[]);
    } catch (error) {
      console.error('Error fetching loyalty transactions:', error);
    }
  };

  // Créer un programme de fidélité
  const createLoyaltyProgram = async (programData: Partial<LoyaltyProgram>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('loyalty_program')
        .insert({
          repairer_id: user.id,
          program_name: programData.program_name || 'Programme Fidélité',
          points_per_euro: programData.points_per_euro || 1.0,
          welcome_bonus: programData.welcome_bonus || 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setLoyaltyProgram(data);
      
      toast({
        title: 'Programme créé',
        description: 'Votre programme de fidélité a été créé avec succès.',
      });
    } catch (error) {
      console.error('Error creating loyalty program:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le programme de fidélité.',
        variant: 'destructive',
      });
    }
  };

  // Ajouter des points à un client
  const addPointsToCustomer = async (customerEmail: string, customerName: string, points: number, description: string) => {
    if (!user?.id) return;

    try {
      // Vérifier si le client existe
      let { data: customer, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('repairer_id', user.id)
        .eq('customer_email', customerEmail)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!customer) {
        // Créer le client
        const { data: newCustomer, error: createError } = await supabase
          .from('loyalty_points')
          .insert({
            repairer_id: user.id,
            customer_id: crypto.randomUUID(),
            customer_email: customerEmail,
            customer_name: customerName,
            total_points: points,
            lifetime_points: points,
          })
          .select()
          .single();

        if (createError) throw createError;
        customer = newCustomer;
      } else {
        // Mettre à jour les points du client existant
        const { error: updateError } = await supabase
          .from('loyalty_points')
          .update({
            total_points: customer.total_points + points,
            lifetime_points: customer.lifetime_points + points,
            customer_name: customerName,
          })
          .eq('id', customer.id);

        if (updateError) throw updateError;
      }

      // Enregistrer la transaction
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          repairer_id: user.id,
          customer_id: customer.id,
          transaction_type: 'earned',
          points_amount: points,
          description,
        });

      if (transactionError) throw transactionError;

      await fetchLoyaltyCustomers();
      await fetchLoyaltyTransactions();

      toast({
        title: 'Points ajoutés',
        description: `${points} points ajoutés pour ${customerName}`,
      });
    } catch (error) {
      console.error('Error adding points:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter les points.',
        variant: 'destructive',
      });
    }
  };

  // Racheter des points
  const redeemPoints = async (customerId: string, points: number, description: string) => {
    if (!user?.id) return;

    try {
      const customer = loyaltyCustomers.find(c => c.id === customerId);
      if (!customer || customer.total_points < points) {
        toast({
          title: 'Erreur',
          description: 'Points insuffisants pour cette opération.',
          variant: 'destructive',
        });
        return;
      }

      // Mettre à jour les points du client
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          total_points: customer.total_points - points,
        })
        .eq('id', customerId);

      if (updateError) throw updateError;

      // Enregistrer la transaction
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          repairer_id: user.id,
          customer_id: customerId,
          transaction_type: 'redeemed',
          points_amount: -points,
          description,
        });

      if (transactionError) throw transactionError;

      await fetchLoyaltyCustomers();
      await fetchLoyaltyTransactions();

      toast({
        title: 'Points échangés',
        description: `${points} points échangés avec succès`,
      });
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'échanger les points.',
        variant: 'destructive',
      });
    }
  };

  // Calculer les statistiques du programme
  const getLoyaltyStats = () => {
    const totalCustomers = loyaltyCustomers.length;
    const totalPointsDistributed = loyaltyCustomers.reduce((sum, customer) => sum + customer.lifetime_points, 0);
    const totalPointsRedeemed = loyaltyTransactions
      .filter(t => t.transaction_type === 'redeemed')
      .reduce((sum, t) => sum + Math.abs(t.points_amount), 0);
    const redemptionRate = totalPointsDistributed > 0 ? (totalPointsRedeemed / totalPointsDistributed) * 100 : 0;

    return {
      totalCustomers,
      totalPointsDistributed,
      totalPointsRedeemed,
      redemptionRate: Math.round(redemptionRate * 10) / 10,
      averagePointsPerCustomer: totalCustomers > 0 ? Math.round(totalPointsDistributed / totalCustomers) : 0,
    };
  };

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        fetchLoyaltyProgram(),
        fetchLoyaltyCustomers(),
        fetchLoyaltyTransactions(),
      ]).finally(() => setLoading(false));
    }
  }, [user?.id]);

  return {
    loading,
    loyaltyProgram,
    loyaltyCustomers,
    loyaltyTransactions,
    createLoyaltyProgram,
    addPointsToCustomer,
    redeemPoints,
    getLoyaltyStats,
    fetchLoyaltyProgram,
    fetchLoyaltyCustomers,
    fetchLoyaltyTransactions,
  };
};