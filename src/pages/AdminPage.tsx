
import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();

  const handleFakeSignOut = () => {
    // Nettoie tout trace d'auth Supabase local (juste au cas où - safe to no-op si non connecté)
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    // Redirige vers la page d'accueil
    navigate('/');
  };

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
            <Button onClick={handleFakeSignOut} variant="outline">
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
