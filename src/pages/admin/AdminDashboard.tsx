import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/loading-spinner';

const AdminDashboard: React.FC = () => {
  const { user, profile, loading, isAdmin } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Administration
        </h1>
        <p className="text-muted-foreground">
          Bienvenue dans l'interface d'administration !
        </p>
        {/* Add admin dashboard content here */}
      </div>
    </div>
  );
};

export default AdminDashboard;