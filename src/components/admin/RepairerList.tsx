
import React, { useState } from 'react';
import { useRepairersData } from '@/hooks/useRepairersData';
import RepairersManagementTabs from '@/components/repairers/RepairersManagementTabs';
import RepairerProfileModal from '@/components/RepairerProfileModal';

const RepairerList: React.FC = () => {
  const { subscriptions, repairers, loading, stats, fetchData } = useRepairersData();
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleViewProfile = (repairerId: string) => {
    setSelectedRepairerId(repairerId);
    setProfileModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des réparateurs...</div>
      </div>
    );
  }

  return (
    <>
      <RepairersManagementTabs
        repairers={repairers}
        subscriptions={subscriptions}
        stats={stats}
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
    </>
  );
};

export default RepairerList;
