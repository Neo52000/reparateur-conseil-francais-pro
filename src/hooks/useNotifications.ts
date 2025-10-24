import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('push_notifications')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('sent_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const mappedNotifications = (data || []).map(n => ({
          id: n.id,
          title: n.title,
          message: n.body,
          type: n.type,
          is_read: n.is_read,
          created_at: n.sent_at,
          data: n.metadata
        }));

        setNotifications(mappedNotifications);
        setUnreadCount(mappedNotifications.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to changes
    const channel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'push_notifications',
          filter: `user_id=eq.${effectiveUserId}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId]);

  return { notifications, unreadCount, loading };
};
