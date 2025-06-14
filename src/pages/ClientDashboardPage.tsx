
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboard from '@/components/ClientDashboard';

const ClientDashboardPage = () => {
  const { user, loading, profile, canAccessClient, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/client/auth');
      return;
    }

    // Vérifier si l'utilisateur peut accéder à l'interface client
    if (!canAccessClient) {
      if (profile?.role === 'repairer') {
        navigate('/repairer');
      } else {
        navigate('/');
      }
      return;
    }
  }, [user, loading, profile, canAccessClient, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Chargement de votre espace client...</div>
        </div>
      </div>
    );
  }

  if (!user || !canAccessClient) {
    return null;
  }

  return (
    <div>
      {/* Bandeau admin pour indiquer le mode test */}
      {isAdmin && profile?.role === 'admin' && (
        <div className="bg-blue-100 border-b border-blue-300 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium mr-3">
                MODE ADMIN
              </div>
              <span className="text-blue-800 font-medium">Test Interface Client</span>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Retour Admin
            </button>
          </div>
        </div>
      )}
      <ClientDashboard />
    </div>
  );
};

export default ClientDashboardPage;
