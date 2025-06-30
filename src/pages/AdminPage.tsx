
import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import AdminAuthForm from '@/components/AdminAuthForm';
import EnhancedScrapingHub from '@/components/scraping/EnhancedScrapingHub';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Users, Package, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import experimental comps
import ReferralInvite from '@/components/ReferralInvite';
import AIPreDiagChatBox from '@/components/AIPreDiagChatBox';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();

  console.log('🔍 AdminPage render - user:', user, 'isAdmin:', isAdmin);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Admin sign out initiated...');
      
      await signOut();
      
      console.log('✅ Admin sign out completed, redirecting...');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté de l'administration"
      });
      
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('💥 Exception during admin sign out:', error);
      
      // Même en cas d'erreur, rediriger
      toast({
        title: "Déconnexion effectuée",
        description: "Vous avez été déconnecté"
      });
      
      navigate('/', { replace: true });
    }
  };

  // Show login form if user is not authenticated or not admin
  if (!user || !isAdmin) {
    console.log('🔄 Showing AdminAuthForm - user:', !!user, 'isAdmin:', isAdmin);
    return <AdminAuthForm />;
  }

  console.log('✅ Rendering admin interface for user:', user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">RepairHub Admin</h1>
              <p className="text-sm text-gray-600">
                Interface d'administration avec IA
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/admin/catalog')} 
                variant="secondary"
                size="sm"
              >
                <Package className="h-4 w-4 mr-2" />
                Gestion Catalogue
              </Button>
              <Button 
                onClick={() => navigate('/admin/features')} 
                variant="secondary"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Fonctionnalités
              </Button>
              <Button 
                onClick={() => navigate('/admin/repairers')} 
                variant="secondary"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Réparateurs
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {/* Dashboard principal */}
          <section>
            <AdminDashboard />
          </section>

          {/* Hub de scraping intelligent */}
          <section className="bg-white rounded-lg shadow p-6">
            <EnhancedScrapingHub />
          </section>

          {/* Zone expérimentale */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Zone expérimentale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <ReferralInvite />
              </div>
              <div className="border rounded-lg p-4">
                <AIPreDiagChatBox />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
