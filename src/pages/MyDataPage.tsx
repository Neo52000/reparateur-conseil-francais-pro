import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DataAccessRequest from '@/components/gdpr/DataAccessRequest';
import PrivacyPreferencesCenter from '@/components/gdpr/PrivacyPreferencesCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Download, Settings } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const MyDataPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Mes données personnelles
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos données personnelles et vos préférences de confidentialité conformément au RGPD
            </p>
          </div>

          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Droits RGPD
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Préférences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="mt-6">
              <DataAccessRequest />
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <PrivacyPreferencesCenter />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyDataPage;
