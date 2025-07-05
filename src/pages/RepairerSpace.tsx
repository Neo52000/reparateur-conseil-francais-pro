
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerDashboardWithModules from '@/components/repairer-dashboard/RepairerDashboardWithModules';

const RepairerSpace = () => {
  const { user, loading, canAccessRepairer, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RepairerSpace - Auth state:', { 
      user: !!user, 
      loading, 
      canAccessRepairer, 
      profileRole: profile?.role,
      profileExists: !!profile 
    });
    
    if (loading) {
      console.log('RepairerSpace - Still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('RepairerSpace - No user, redirecting to repairer auth');
      navigate('/repairer-auth', { replace: true });
      return;
    }

    // Attendre que le profil soit chargé
    if (user && !profile) {
      console.log('RepairerSpace - User exists but no profile yet, waiting...');
      return;
    }

    // Vérifier l'accès réparateur
    if (!canAccessRepairer) {
      console.log('RepairerSpace - No repairer access, redirecting based on role');
      if (profile?.role === 'client') {
        navigate('/client', { replace: true });
      } else {
        console.log('RepairerSpace - Unknown role, redirecting to repairer auth');
        navigate('/repairer-auth', { replace: true });
      }
      return;
    }

    console.log('RepairerSpace - All checks passed, showing dashboard');
  }, [user, loading, canAccessRepairer, navigate, profile]);

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div>Chargement de votre espace réparateur...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('RepairerSpace - Rendering null, should redirect to auth');
    return null;
  }

  if (!canAccessRepairer) {
    console.log('RepairerSpace - No access, rendering null, should redirect');
    return null;
  }

  console.log('RepairerSpace - Rendering dashboard');
  return <RepairerDashboardWithModules />;
};

export default RepairerSpace;
