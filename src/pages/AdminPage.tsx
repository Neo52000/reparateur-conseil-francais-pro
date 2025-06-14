
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/');
      return;
    }

    if (!isAdmin) {
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
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">RepairHub Admin</h1>
              <p className="text-sm text-gray-600">Bienvenue, {profile?.first_name} {profile?.last_name}</p>
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
