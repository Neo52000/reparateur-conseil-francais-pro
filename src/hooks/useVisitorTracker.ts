import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useVisitorAnalytics } from './useVisitorAnalytics';

// Fonction pour détecter le type d'appareil
const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|tablet|blackberry|opera mini/.test(userAgent)) {
    return /ipad|tablet/.test(userAgent) ? 'tablet' : 'mobile';
  }
  return 'desktop';
};

// Fonction pour détecter le navigateur
const getBrowser = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
};

// Générer un ID de session unique
const generateSessionId = () => {
  const sessionId = sessionStorage.getItem('visitor_session_id');
  if (sessionId) return sessionId;
  
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('visitor_session_id', newSessionId);
  return newSessionId;
};

export const useVisitorTracker = () => {
  const location = useLocation();
  const { trackVisitor } = useVisitorAnalytics();

  useEffect(() => {
    // Tracker la visite de page automatiquement
    const trackPageVisit = async () => {
      try {
        const sessionId = generateSessionId();
        const deviceType = getDeviceType();
        const browser = getBrowser();
        const referrer = document.referrer || 'Direct';
        const userAgent = navigator.userAgent;

        await trackVisitor({
          page_path: location.pathname,
          session_id: sessionId,
          user_agent: userAgent,
          referrer: referrer,
          device_type: deviceType,
          browser: browser
        });
      } catch (error) {
        console.error('Erreur lors du tracking de visite:', error);
      }
    };

    // Petit délai pour éviter les appels trop fréquents
    const timer = setTimeout(trackPageVisit, 500);
    
    return () => clearTimeout(timer);
  }, [location.pathname, trackVisitor]);

  return null; // Ce hook n'a pas de rendu
};