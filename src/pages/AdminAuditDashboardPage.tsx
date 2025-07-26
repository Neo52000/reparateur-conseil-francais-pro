
import React from 'react';
import Navigation from '@/components/Navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminAuditDashboard from '@/components/admin/AdminAuditDashboard';
import { useAuth } from '@/hooks/useAuth';
import AdminAuthForm from '@/components/AdminAuthForm';

const AdminAuditDashboardPage: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminAuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tableau de bord d'audit</h1>
          <p className="text-muted-foreground">Vue d'ensemble complète du système d'audit</p>
        </div>
        <AdminAuditDashboard />
      </div>
    </div>
  );
};

export default AdminAuditDashboardPage;
