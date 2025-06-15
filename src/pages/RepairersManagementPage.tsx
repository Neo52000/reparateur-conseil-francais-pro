
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import RepairersStats from '@/components/repairers/RepairersStats';
import RepairersManagementHeader from '@/components/repairers/RepairersManagementHeader';
import RepairersManagementTabs from '@/components/repairers/RepairersManagementTabs';
import { useRepairersData } from '@/hooks/useRepairersData';

const RepairersManagementPage = () => {
  const { subscriptions, repairers, loading, stats, fetchData } = useRepairersData();
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleViewProfile = (repairerId: string) => {
    setSelectedRepairerId(repairerId);
    setProfileModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RepairersManagementHeader onRefresh={fetchData} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <RepairersStats stats={stats} />

        <RepairersManagementTabs
          repairers={repairers}
          subscriptions={subscriptions}
          onViewProfile={handleViewProfile}
          onRefresh={fetchData}
        />
      </main>

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

export default RepairersManagementPage;
