import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/loading-spinner';

const RepairerDashboard: React.FC = () => {
  const { user, profile, loading, canAccessRepairer } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !canAccessRepairer) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Espace Réparateur
        </h1>
        <p className="text-muted-foreground">
          Bienvenue dans votre espace réparateur !
        </p>
        {/* Add repairer dashboard content here */}
      </div>
    </div>
  );
};

export default RepairerDashboard;