
import React, { useEffect } from 'react';
import { useAdminAudit } from '@/hooks/useAdminAudit';
import { useAuth } from '@/hooks/useAuth';

interface AdminAuditMiddlewareProps {
  children: React.ReactNode;
}

/**
 * Middleware pour capturer automatiquement certaines actions critiques
 */
const AdminAuditMiddleware: React.FC<AdminAuditMiddlewareProps> = ({ children }) => {
  const { logAction } = useAdminAudit();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Capturer les connexions admin
    logAction('login', 'admin_session', user.id, {
      login_method: 'web_admin',
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    }, 'info');

    // Capturer les déconnexions lors du déchargement de la page
    const handleBeforeUnload = () => {
      logAction('logout', 'admin_session', user.id, {
        logout_method: 'page_unload',
        timestamp: new Date().toISOString()
      }, 'info');
    };

    // Capturer les changements de route (navigation)
    const handleRouteChange = () => {
      logAction('configuration_change', 'admin_navigation', user.id, {
        new_route: window.location.pathname,
        timestamp: new Date().toISOString()
      }, 'info');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user, isAdmin, logAction]);

  return <>{children}</>;
};

export default AdminAuditMiddleware;
