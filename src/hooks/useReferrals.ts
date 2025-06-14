
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  status: string;
  reward_claimed: boolean;
  code: string;
  created_at: string;
}

export const useReferrals = (userId?: string) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const getReferrals = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setReferrals(data);
    setLoading(false);
  };

  const createReferral = async (email: string) => {
    const code =
      Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from("referrals")
      .insert([{ referrer_id: userId, referred_email: email, code }])
      .select();
    if (!error && data) setReferrals((prev) => [data[0], ...prev]);
    return { data, error };
  };

  useEffect(() => {
    if (!userId) return;
    getReferrals();
  }, [userId]);

  return { referrals, loading, createReferral, refetch: getReferrals };
};
