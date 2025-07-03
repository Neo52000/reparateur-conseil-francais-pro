
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
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="animate-fade-in">
        <AdminStatsCards stats={stats} />
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in">
        {/* Dashboard overview */}
        <div className="xl:col-span-3 space-y-6">
          <DashboardOverview stats={{
            totalRepairers: stats.totalRepairers,
            totalSubscriptions: stats.totalSubscriptions,
            totalInterests: stats.totalInterests,
            revenue: stats.totalRevenue
          }} />
        </div>
        
        {/* Side widgets */}
        <div className="xl:col-span-1 space-y-6">
          <DocumentationStatusWidget />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
