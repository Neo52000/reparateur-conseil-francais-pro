
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerAuthForm from '@/components/RepairerAuthForm';

const RepairerAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      // Rediriger vers l'espace réparateur si déjà connecté
      navigate('/repairer', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  // Toujours afficher le formulaire d'authentification si pas connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Espace Réparateur
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Connectez-vous pour gérer votre activité
            </p>
          </div>
          <RepairerAuthForm />
        </div>
      </div>
    );
  }

  // Si connecté, redirection automatique (ne devrait pas arriver grâce au useEffect)
  return null;
};

export default RepairerAuth;
