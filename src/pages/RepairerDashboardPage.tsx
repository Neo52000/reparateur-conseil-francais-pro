
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RepairerDashboard from '@/components/RepairerDashboard';
import { PlanPreviewControls } from '@/components/PlanPreviewControls';

const RepairerDashboardPage = () => {
  const { user, loading, profile, canAccessRepairer, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔧 RepairerDashboardPage - Auth state:', {
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role,
      userEmail: user?.email,
      canAccessRepairer,
      loading
    });

    if (loading) {
      console.log('⏳ RepairerDashboardPage - Still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('❌ RepairerDashboardPage - No user, redirecting to auth');
      navigate('/repairer/auth');
      return;
    }

    // Attendre que le profil soit chargé
    if (user && !profile) {
      console.log('⏳ RepairerDashboardPage - User exists but no profile yet, waiting...');
      return;
    }

    // Vérifier l'accès réparateur
    if (!canAccessRepairer) {
      console.log('❌ RepairerDashboardPage - No repairer access, redirecting based on role');
      if (profile?.role === 'client') {
        navigate('/client');
      } else {
        navigate('/');
      }
      return;
    }

    console.log('✅ RepairerDashboardPage - All checks passed, showing dashboard');
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
      
      {/* Contrôles de prévisualisation des plans */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <PlanPreviewControls />
      </div>
      
      <RepairerDashboard />
    </div>
  );
};

export default RepairerDashboardPage;
