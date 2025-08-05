import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useSimpleAuth';
import LoadingSpinner from '@/components/ui/loading-spinner';

const DashboardPage: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (profile?.role === 'repairer') {
    return <Navigate to="/repairer" replace />;
  }

  // Default client dashboard
  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Bienvenue {profile?.first_name} {profile?.last_name} !
        </p>
        {/* Add client dashboard content here */}
      </div>
    </div>
  );
};

export default DashboardPage;