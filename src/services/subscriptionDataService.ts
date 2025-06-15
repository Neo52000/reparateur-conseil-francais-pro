
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
}

export const fetchSubscriptions = async (): Promise<SubscriptionData[]> => {
  const { data, error } = await supabase
    .from('admin_subscription_overview')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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
