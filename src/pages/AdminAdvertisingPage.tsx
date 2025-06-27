
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import AdminAuthForm from '@/components/AdminAuthForm';
import AdBannerManagement from '@/components/advertising/AdBannerManagement';

const AdminAdvertisingPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <AdminAuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin')} 
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour Admin
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gestion Publicitaire</h1>
                <p className="text-sm text-gray-600">
                  Gérez les bannières publicitaires de la plateforme
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AdBannerManagement />
      </main>
    </div>
  );
};

export default AdminAdvertisingPage;
