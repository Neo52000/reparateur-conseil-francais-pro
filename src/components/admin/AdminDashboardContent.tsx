
import React from 'react';
import AdminStatsCards from './AdminStatsCards';
import DashboardOverview from './DashboardOverview';
import DocumentationStatusWidget from './DocumentationStatusWidget';

interface AdminDashboardContentProps {
  activeTab?: string;
  subscriptions?: any[];
  repairers?: any[];
  onViewProfile?: () => void;
  onRefresh?: () => Promise<void>;
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  activeTab,
  subscriptions = [],
  repairers = [],
  onViewProfile,
  onRefresh
}) => {
  // Calculer les stats à partir des données disponibles
  const stats = {
    totalRepairers: repairers.length,
    totalSubscriptions: subscriptions.length,
    totalInterests: 0, // À ajuster selon les données disponibles
    totalRevenue: 0 // À ajuster selon les données disponibles
  };

  return (
    <div className="space-y-6">
      <AdminStatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardOverview stats={{
            totalRepairers: stats.totalRepairers,
            totalSubscriptions: stats.totalSubscriptions,
            totalInterests: stats.totalInterests,
            revenue: stats.totalRevenue
          }} />
        </div>
        <div>
          <DocumentationStatusWidget />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
