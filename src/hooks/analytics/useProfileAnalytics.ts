import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAnalyticsData {
  repairerId: string;
  profileView: boolean;
  contactClick?: boolean;
  claimClick?: boolean;
  userAgent?: string;
  referrer?: string;
}

export const useProfileAnalytics = () => {
  const trackProfileView = async (data: ProfileAnalyticsData) => {
    try {
      await supabase
        .from('profile_analytics')
        .insert({
          repairer_id: data.repairerId,
          event_type: 'profile_view',
          user_agent: data.userAgent || navigator.userAgent,
          referrer: data.referrer || document.referrer,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  };

  const trackClaimClick = async (repairerId: string) => {
    try {
      await supabase
        .from('profile_analytics')
        .insert({
          repairer_id: repairerId,
          event_type: 'claim_click',
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking claim click:', error);
    }
  };

  const trackContactClick = async (repairerId: string, contactType: 'phone' | 'email' | 'message') => {
    try {
      await supabase
        .from('profile_analytics')
        .insert({
          repairer_id: repairerId,
          event_type: 'contact_click',
          event_data: { contact_type: contactType },
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking contact click:', error);
    }
  };

  return {
    trackProfileView,
    trackClaimClick,
    trackContactClick
  };
};