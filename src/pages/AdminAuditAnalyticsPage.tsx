
import React from 'react';
import Navigation from '@/components/Navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuditAnalytics from '@/components/admin/AdminAuditAnalytics';
import { useAuth } from '@/hooks/useAuth';
import AdminAuthForm from '@/components/AdminAuthForm';

const AdminAuditAnalyticsPage: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <AdminLayout
        title="Analytics d'audit"
        subtitle="Analyse avancée des logs d'audit et tendances"
        onRefresh={() => window.location.reload()}
      >
        <AdminAuditAnalytics />
      </AdminLayout>
    </div>
  );
};

export default AdminAuditAnalyticsPage;
