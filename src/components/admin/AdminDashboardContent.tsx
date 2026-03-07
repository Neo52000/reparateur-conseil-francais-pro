
import React, { useEffect, useState } from 'react';
import AdminStatsCards from './AdminStatsCards';
import DashboardOverview from './DashboardOverview';
import VisitorAnalytics from './VisitorAnalytics';
import { supabase } from '@/integrations/supabase/client';


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
  const [totalInterests, setTotalInterests] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const [interestsRes, revenueRes] = await Promise.all([
        supabase.from('client_interests').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
      ]);
      setTotalInterests(interestsRes.count || 0);
      setTotalRevenue(
        (revenueRes.data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
      );
    };
    fetchStats();
  }, []);

  const stats = {
    totalRepairers: repairers.length,
    totalSubscriptions: subscriptions.length,
    totalInterests,
    totalRevenue,
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
