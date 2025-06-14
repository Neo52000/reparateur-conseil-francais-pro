
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import AdminAuthForm from '@/components/AdminAuthForm';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
  const { user, profile, loading, signOut, isAdmin } = useAuth();

  console.log('🔧 AdminPage render:', { 
    hasUser: !!user, 
    profile: profile ? { role: profile.role, email: profile.email } : null, 
    loading, 
    isAdmin 
  });

  const handleSignOut = async () => {
    console.log('👋 Admin signing out...');
    await signOut();
  };

  // ACCÈS TEMPORAIRE SANS AUTHENTIFICATION
  // TODO: Remettre l'authentification plus tard
  console.log('⚠️ ACCÈS ADMIN TEMPORAIRE ACTIVÉ - PAS D\'AUTHENTIFICATION REQUISE');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">RepairHub Admin</h1>
              <p className="text-sm text-gray-600">
                Interface d'administration (Accès temporaire activé)
              </p>
              <div className="text-xs text-orange-500 mt-1 font-medium">
                ⚠️ Mode développement - Authentification désactivée
              </div>
            </div>
            {user && (
              <Button onClick={handleSignOut} variant="outline">
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AdminDashboard />
      </main>
    </div>
  );
};

export default AdminPage;
