
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId || !supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) setNotifications(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId || !supabase) return;
    fetchNotifications();
    const channel = supabase.channel("notifications")
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => { fetchNotifications(); })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    loading,
    refetch: fetchNotifications
  };
};
