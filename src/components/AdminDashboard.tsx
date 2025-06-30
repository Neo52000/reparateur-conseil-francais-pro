
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import RepairerProfileModal from './RepairerProfileModal';
import { useRepairersData } from '@/hooks/useRepairersData';
import AdminDashboardHeader from './admin/AdminDashboardHeader';
import AdminStatsCards from './admin/AdminStatsCards';
import AdminNavigationTabs, { type TabType } from './admin/AdminNavigationTabs';
import AdminDashboardContent from './admin/AdminDashboardContent';
import SystemAuditPanel from './admin/SystemAuditPanel';

const AdminDashboard = () => {
  const { subscriptions, repairers, loading, stats, fetchData } = useRepairersData();
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  console.log('🎯 AdminDashboard render - loading:', loading, 'subscriptions:', subscriptions?.length, 'repairers:', repairers?.length);

  const handleViewProfile = (repairerId: string) => {
    setSelectedRepairerId(repairerId);
    setProfileModalOpen(true);
  };

  if (loading) {
    console.log('⏳ AdminDashboard showing loading state');
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement des données admin...</span>
        </div>
      </div>
    );
  }

  console.log('✅ AdminDashboard rendering content');

  try {
    return (
      <div className="space-y-6">
        <AdminDashboardHeader onRefresh={fetchData} />

        <AdminStatsCards stats={{
          totalRepairers: stats.totalRepairers,
          totalSubscriptions: stats.totalSubscriptions,
          totalInterests: stats.totalInterests,
          totalRevenue: stats.totalRevenue
        }} />

        {/* Nouveau panneau d'audit système */}
        <SystemAuditPanel />

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
  } catch (error) {
    console.error('❌ Error rendering AdminDashboard:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Erreur de rendu du dashboard</h3>
        <p className="text-red-700 text-sm">
          Une erreur s'est produite lors du rendu du dashboard admin. 
          Consultez la console pour plus de détails.
        </p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }
};

export default AdminDashboard;
