
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import RepairerProfileModal from './RepairerProfileModal';
import { useRepairersData } from '@/hooks/useRepairersData';
import AdminDashboardHeader from './admin/AdminDashboardHeader';
import AdminStatsCards from './admin/AdminStatsCards';
import AdminNavigationTabs, { type TabType } from './admin/AdminNavigationTabs';
import AdminDashboardContent from './admin/AdminDashboardContent';

const AdminDashboard = () => {
  const { subscriptions, repairers, loading, stats, fetchData } = useRepairersData();
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleViewProfile = (repairerId: string) => {
    setSelectedRepairerId(repairerId);
    setProfileModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminDashboardHeader onRefresh={fetchData} />

      <AdminStatsCards stats={stats} />

      <AdminNavigationTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />

      <AdminDashboardContent
        activeTab={activeTab}
        subscriptions={subscriptions}
        repairers={repairers}
        onViewProfile={handleViewProfile}
        onRefresh={fetchData}
      />

      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedRepairerId(null);
          }}
          repairerId={selectedRepairerId}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
