
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ClientAuthForm from '@/components/ClientAuthForm';

const ClientAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      // Vérifier s'il y a une action en attente
      const pendingAction = localStorage.getItem('pendingAction');
      
      if (pendingAction) {
        try {
          const action = JSON.parse(pendingAction);
          localStorage.removeItem('pendingAction');
          
          // Rediriger vers la page principale avec l'action en paramètre
          // L'action sera traitée par le composant parent
          navigate('/', { 
            state: { 
              pendingAction: action
            }
          });
        } catch (error) {
          console.error('Erreur lors du parsing de l\'action en attente:', error);
          navigate('/client');
        }
      } else {
        navigate('/client');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Espace Client
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous pour gérer vos réparations
          </p>
        </div>
        <ClientAuthForm />
      </div>
    </div>
  );
};

export default ClientAuth;
