
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionData {
  id: string;
  repairer_id: string;
  email: string;
  subscription_tier: string;
  billing_cycle: string;
  subscribed: boolean;
  subscription_end: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  plan_name: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  business_name?: string | null; // Add business name from repairer profiles
}

export const fetchSubscriptions = async (): Promise<SubscriptionData[]> => {
  const { data, error } = await supabase
    .from('admin_subscription_overview')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const subscriptions = data || [];
  
  // Fetch business names from repairer profiles for each subscription
  const enrichedSubscriptions = await Promise.all(
    subscriptions.map(async (subscription) => {
      // Try to get business name from repairer_profiles table
      const { data: profileData } = await supabase
        .from('repairer_profiles')
        .select('business_name')
        .eq('user_id', subscription.repairer_id)
        .maybeSingle();
      
      return {
        ...subscription,
        business_name: profileData?.business_name || null
      };
    })
  );
  
  return enrichedSubscriptions;
};

export const calculateSubscriptionStats = (subscriptions: SubscriptionData[]) => {
  const total = subscriptions.length;
  const active = subscriptions.filter(sub => sub.subscribed).length;
  const monthlyRev = subscriptions.reduce((sum, sub) => {
    if (sub.subscribed && sub.billing_cycle === 'monthly') {
      return sum + (sub.price_monthly || 0);
    }
    return sum;
  }, 0);
  const yearlyRev = subscriptions.reduce((sum, sub) => {
    if (sub.subscribed && sub.billing_cycle === 'yearly') {
      return sum + (sub.price_yearly || 0);
    }
    return sum;
  }, 0);

  return {
    totalSubscriptions: total,
    activeSubscriptions: active,
    monthlyRevenue: monthlyRev,
    yearlyRevenue: yearlyRev
  };
};
