
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerDashboard from '@/components/RepairerDashboard';

const RepairerDashboardPage = () => {
  const { user, loading, profile, canAccessRepairer, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/repairer/auth');
      return;
    }

    // Vérifier si l'utilisateur peut accéder à l'interface réparateur
    if (!canAccessRepairer) {
      if (profile?.role === 'client') {
        navigate('/client');
      } else {
        navigate('/');
      }
      return;
    }
  }, [user, loading, profile, canAccessRepairer, navigate]);

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

  return (
    <div>
      {/* Bandeau admin pour indiquer le mode test */}
      {isAdmin && profile?.role === 'admin' && (
        <div className="bg-orange-100 border-b border-orange-300 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-600 text-white px-2 py-1 rounded text-sm font-medium mr-3">
                MODE ADMIN
              </div>
              <span className="text-orange-800 font-medium">Test Interface Réparateur</span>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
            >
              Retour Admin
            </button>
          </div>
        </div>
      )}
      <RepairerDashboard />
    </div>
  );
};

export default RepairerDashboardPage;
