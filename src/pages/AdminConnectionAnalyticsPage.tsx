/**
 * Page dédiée aux analytics de connexion dans l'interface admin
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ConnectionAnalyticsDashboard } from '@/components/admin/analytics/ConnectionAnalyticsDashboard';
import Navigation from '@/components/Navigation';

const AdminConnectionAnalyticsPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <ConnectionAnalyticsDashboard />
      </main>
    </div>
  );
};

export default AdminConnectionAnalyticsPage;