
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerDashboard from '@/components/RepairerDashboard';

const RepairerSpace = () => {
  const { user, loading, canAccessRepairer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      // Rediriger vers l'auth réparateur si pas connecté
      navigate('/repairer/auth', { replace: true });
      return;
    }

    // Vérifier l'accès réparateur
    if (!canAccessRepairer) {
      // Si pas d'accès réparateur, rediriger vers l'accueil
      navigate('/', { replace: true });
      return;
    }
  }, [user, loading, canAccessRepairer, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div>Chargement de votre espace réparateur...</div>
        </div>
      </div>
    );
  }

  if (!user || !canAccessRepairer) {
    return null;
  }

  return <RepairerDashboard />;
};

export default RepairerSpace;
