import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ClientEnhancedDashboard from '@/components/client-dashboard/ClientEnhancedDashboard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const ClientDashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ClientEnhancedDashboard />
    </div>
  );
};

export default ClientDashboardPage;
