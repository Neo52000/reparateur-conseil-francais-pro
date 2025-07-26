
import React from 'react';
import Navigation from '@/components/Navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminAuditLogsViewer from '@/components/admin/AdminAuditLogsViewer';
import { useAuth } from '@/hooks/useAuth';
import AdminAuthForm from '@/components/AdminAuthForm';

const AdminAuditPage: React.FC = () => {
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
          <h1 className="text-3xl font-bold">Logs d'audit</h1>
          <p className="text-muted-foreground">Traçabilité des actions administratives</p>
        </div>
        <AdminAuditLogsViewer />
      </div>
    </div>
  );
};

export default AdminAuditPage;
