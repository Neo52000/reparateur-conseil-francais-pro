import React from 'react';
import { useVisitorAnalytics } from '@/hooks/useVisitorAnalytics';

// Composant pour initialiser le tracking automatiquement
export const GlobalVisitorTracker: React.FC = () => {
  const { trackVisitor } = useVisitorAnalytics();

  React.useEffect(() => {
    // Initialiser le tracking si pas déjà fait
    const hasTrackedSession = sessionStorage.getItem('visitor_session_tracked');
    
    if (!hasTrackedSession) {
      const trackInitialVisit = async () => {
        try {
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('visitor_session_id', sessionId);
          sessionStorage.setItem('visitor_session_tracked', 'true');

          await trackVisitor({
            page_path: window.location.pathname,
            session_id: sessionId,
            user_agent: navigator.userAgent,
            referrer: document.referrer || 'Direct',
            device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browser: /Chrome/.test(navigator.userAgent) ? 'Chrome' : 'Other'
          });
        } catch (error) {
          console.warn('Warning lors du tracking initial (non-critique):', error);
          // Ne pas faire planter l'app pour un problème de tracking
        }
      };

      trackInitialVisit();
    }
  }, [trackVisitor]);

  return null;
};