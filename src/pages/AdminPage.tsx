
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';

const AdminPage = () => {
  const { profile, loading, signOut } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <Button variant="outline" onClick={signOut}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPage;
