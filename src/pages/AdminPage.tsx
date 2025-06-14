
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  console.log('🔧 AdminPage render:', { 
    hasUser: !!user, 
    profile: profile ? { role: profile.role, email: profile.email } : null, 
    loading, 
    isAdmin 
  });

  useEffect(() => {
    console.log('⚡ AdminPage useEffect triggered:', { 
      loading, 
      hasUser: !!user, 
      isAdmin, 
      profileRole: profile?.role,
      profileEmail: profile?.email 
    });
    
    // Don't do anything while still loading
    if (loading) {
      console.log('⏳ Still loading, waiting...');
      return;
    }

    // If no user, redirect to home
    if (!user) {
      console.log('❌ No user found, redirecting to home');
      navigate('/');
      return;
    }

    // If user exists but profile is still loading, wait a bit more
    if (!profile) {
      console.log('👤 User exists but no profile yet, waiting for profile...');
      return;
    }

    // If user is not admin, redirect based on role
    if (!isAdmin) {
      console.log('🚫 User is not admin, redirecting based on role:', profile.role);
      switch (profile.role) {
        case 'client':
          navigate('/client');
          break;
        case 'repairer':
          navigate('/repairer');
          break;
        default:
          navigate('/');
          break;
      }
      return;
    }

    console.log('✅ User is admin, staying on admin page');
  }, [user, isAdmin, loading, profile, navigate]);

  const handleSignOut = async () => {
    console.log('👋 Admin signing out...');
    await signOut();
    navigate('/');
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

  // Show temporary state while redirecting
  if (!user) {
    console.log('🔄 No user in render, should redirect to home');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Redirection vers la page d'accueil...</div>
        </div>
      </div>
    );
  }

  // Show temporary state while waiting for profile or redirecting non-admin users
  if (!profile || !isAdmin) {
    console.log('🔄 Not admin or no profile in render, should redirect');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Vérification des permissions...</div>
          <div className="text-sm text-gray-500 mt-2">
            {!profile ? 'Chargement du profil...' : 'Redirection en cours...'}
          </div>
        </div>
      </div>
    );
  }

  // Only render admin dashboard if user is confirmed admin
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
