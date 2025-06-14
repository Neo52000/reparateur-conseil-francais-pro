
import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Import experimental comps
import ReferralInvite from '@/components/ReferralInvite';
import PartsMarketplace from '@/components/PartsMarketplace';
import AIPreDiagChatBox from '@/components/AIPreDiagChatBox';

const AdminPage = () => {
  const navigate = useNavigate();

  const handleFakeSignOut = () => {
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
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
            <div className="flex gap-2">
              <Button onClick={() => window.location.href='/admin/features'} variant="secondary">
                Gérer fonctionnalités par plan
              </Button>
              <Button onClick={handleFakeSignOut} variant="outline">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AdminDashboard />
        <section className="bg-white rounded shadow mt-10 p-5">
          <h2 className="text-xl font-bold mb-4">Zone expérimentale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded p-3"><ReferralInvite /></div>
            <div className="border rounded p-3"><PartsMarketplace /></div>
            <div className="border rounded p-3"><AIPreDiagChatBox /></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
