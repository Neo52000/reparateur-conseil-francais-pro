
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  console.log('AdminPage render:', { user: !!user, profile, loading, isAdmin });

  useEffect(() => {
    console.log('AdminPage useEffect:', { loading, user: !!user, isAdmin, profileRole: profile?.role });
    
    if (loading) {
      console.log('Still loading, waiting...');
      return;
    }

    if (!user) {
      console.log('No user, redirecting to home');
      navigate('/');
      return;
    }

    if (!isAdmin) {
      console.log('User is not admin, redirecting based on role:', profile?.role);
      // Rediriger selon le rôle
      if (profile?.role === 'client') {
        navigate('/client');
      } else if (profile?.role === 'repairer') {
        navigate('/repairer');
      } else {
        navigate('/');
      }
      return;
    }

    console.log('User is admin, staying on admin page');
  }, [user, isAdmin, loading, profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <div>Chargement de l'espace administrateur...</div>
          <div className="text-sm text-gray-500 mt-2">Vérification des permissions...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user in render, should redirect');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Redirection en cours...</div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('Not admin in render, should redirect');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Vérification des permissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">RepairHub Admin</h1>
              <p className="text-sm text-gray-600">
                Bienvenue, {profile?.first_name} {profile?.last_name} (Admin)
              </p>
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
