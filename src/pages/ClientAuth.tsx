
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePendingAction } from '@/hooks/usePendingAction';
import ClientAuthForm from '@/components/ClientAuthForm';

const ClientAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pendingAction } = usePendingAction();

  useEffect(() => {
    if (user && !loading) {
      // Si l'utilisateur est connecté et qu'il y a une action en attente
      if (pendingAction) {
        if (pendingAction.type === 'quote_request' || pendingAction.type === 'appointment_request') {
          // Rediriger vers la page d'accueil où le modal sera automatiquement restauré
          navigate('/', { replace: true });
        } else {
          // Sinon rediriger vers l'espace client
          navigate('/client', { replace: true });
        }
      } else {
        // Vérifier aussi l'ancien système pour les devis
        const oldPendingQuote = localStorage.getItem('pendingQuoteAction');
        if (oldPendingQuote) {
          navigate('/', { replace: true });
        } else {
          navigate('/client', { replace: true });
        }
      }
    }
  }, [user, loading, pendingAction, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  const getActionMessage = () => {
    if (pendingAction?.type === 'quote_request') {
      return "Votre demande de devis sera automatiquement restaurée après connexion";
    }
    if (pendingAction?.type === 'appointment_request') {
      return "Votre demande de rendez-vous sera automatiquement restaurée après connexion";
    }
    // Vérifier l'ancien système
    const oldPendingQuote = localStorage.getItem('pendingQuoteAction');
    if (oldPendingQuote) {
      return "Votre demande de devis sera automatiquement restaurée après connexion";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Espace Client
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous pour {pendingAction?.type === 'appointment_request' ? 'prendre votre rendez-vous' : 'envoyer votre demande de devis'}
          </p>
          {getActionMessage() && (
            <p className="mt-2 text-center text-sm text-blue-600 font-medium">
              {getActionMessage()}
            </p>
          )}
        </div>
        <ClientAuthForm />
      </div>
    </div>
  );
};

export default ClientAuth;
