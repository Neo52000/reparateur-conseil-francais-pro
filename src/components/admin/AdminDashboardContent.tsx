
import React from 'react';
import AdminStatsCards from './AdminStatsCards';
import DashboardOverview from './DashboardOverview';
import VisitorAnalytics from './VisitorAnalytics';


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
    totalInterests: 0, // TODO: À connecter avec les vraies données client_interests
    totalRevenue: 0 // TODO: À connecter avec les vraies données de revenue
  };

  return (
    <div className="space-y-8">
      {/* Analytics visiteurs */}
      <VisitorAnalytics />
      
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
          {/* Widgets réservés pour les fonctionnalités futures */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
