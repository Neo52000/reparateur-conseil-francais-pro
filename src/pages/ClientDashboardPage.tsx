
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ClientEnhancedDashboard from '@/components/client-dashboard/ClientEnhancedDashboard';

const ClientDashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <ClientEnhancedDashboard />
    </div>
  );
};

export default ClientDashboardPage;
