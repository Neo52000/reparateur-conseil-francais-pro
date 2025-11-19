import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enhancedToast } from '@/lib/utils/enhancedToast';

interface TimelineEvent {
  id: string;
  event_type: string;
  event_title: string;
  event_description: string | null;
  event_data: any;
  created_at: string;
  created_by: string | null;
}

export const useRepairTimeline = (quoteId: string) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quoteId) return;

    loadEvents();

    // Subscribe to real-time timeline updates
    const subscription = supabase
      .channel(`repair_timeline:${quoteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'repair_timeline_events',
          filter: `quote_id=eq.${quoteId}`
        },
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [quoteId]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_timeline_events')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading timeline events:', error);
      enhancedToast.error({
        title: 'Erreur',
        description: 'Impossible de charger la timeline'
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (
    eventType: string,
    eventTitle: string,
    eventDescription?: string,
    eventData?: any
  ) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const { error } = await supabase
        .from('repair_timeline_events')
        .insert({
          quote_id: quoteId,
          event_type: eventType,
          event_title: eventTitle,
          event_description: eventDescription,
          event_data: eventData || {},
          created_by: user?.id
        });

      if (error) throw error;
      
      enhancedToast.success({
        title: 'Événement ajouté',
        description: eventTitle
      });
    } catch (error) {
      console.error('Error adding timeline event:', error);
      enhancedToast.error({
        title: 'Erreur',
        description: "Impossible d'ajouter l'événement"
      });
    }
  };

  return {
    events,
    loading,
    addEvent
  };
};
