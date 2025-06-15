
import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import AdminAuthForm from '@/components/AdminAuthForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Brain } from 'lucide-react';

// Import experimental comps
import ReferralInvite from '@/components/ReferralInvite';
import AIPreDiagChatBox from '@/components/AIPreDiagChatBox';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show login form if user is not authenticated or not admin
  if (!user || !isAdmin) {
    return <AdminAuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">RepairHub Admin</h1>
              <p className="text-sm text-gray-600">
                Interface d'administration
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/admin/features')} 
                variant="secondary"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Fonctionnalités
              </Button>
              <Button 
                onClick={() => navigate('/admin/scraping-ai')} 
                variant="default"
                size="sm"
              >
                <Brain className="h-4 w-4 mr-2" />
                Scraping IA
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded p-3"><ReferralInvite /></div>
            <div className="border rounded p-3"><AIPreDiagChatBox /></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
