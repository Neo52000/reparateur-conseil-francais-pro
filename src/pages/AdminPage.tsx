
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

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Vérification des permissions administrateur...</div>
          <div className="text-sm text-gray-500 mt-2">Connexion en cours...</div>
        </div>
      </div>
    );
  }

  // Show admin login form if no user is connected
  if (!user) {
    console.log('🔐 No user connected, showing admin login form');
    return <AdminAuthForm />;
  }

  // Show access denied if user is not admin
  if (!isAdmin) {
    console.log('🚫 User is not admin, showing access denied');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-5xl mb-4">🚫</div>
            <h1 className="text-xl font-semibold text-red-800 mb-2">Accès refusé</h1>
            <p className="text-red-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à l'interface d'administration.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Connecté en tant que : {profile?.first_name} {profile?.last_name} ({profile?.role})
            </p>
            <Button onClick={handleSignOut} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show admin dashboard for admin users
  console.log('✅ User is admin, showing admin dashboard');
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">RepairHub Admin</h1>
              <p className="text-sm text-gray-600">
                Bienvenue, {profile.first_name} {profile.last_name} (Admin)
              </p>
              <div className="text-xs text-gray-400 mt-1">
                Email: {profile.email} | Rôle: {profile.role}
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Déconnexion
            </Button>
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
