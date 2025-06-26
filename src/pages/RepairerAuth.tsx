
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerAuthForm from '@/components/RepairerAuthForm';

const RepairerAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('🔧 RepairerAuth - Auth state:', { user: !!user, loading });
    
    if (user && !loading) {
      console.log('✅ RepairerAuth - User authenticated, redirecting to dashboard');
      setIsRedirecting(true);
      // Délai court pour éviter le flash
      setTimeout(() => {
        navigate('/repairer', { replace: true });
      }, 100);
    }
  }, [user, loading, navigate]);

  // État de chargement initial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div className="text-gray-700">Vérification de l'authentification...</div>
        </div>
      </div>
    );
  }

  // État de redirection
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <div className="text-gray-700">Redirection vers votre espace...</div>
        </div>
      </div>
    );
  }

  // Affichage du formulaire d'authentification
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
};

export default RepairerAuth;
