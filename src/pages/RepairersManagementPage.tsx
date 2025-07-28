
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import RepairersManagementHeader from '@/components/repairers/RepairersManagementHeader';
import RepairersTable from '@/components/repairers/RepairersTable';
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
        {/* Note importante pour les réparateurs gratuits */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold text-sm">ℹ️</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Affichage selon l'abonnement</h3>
              <p className="text-sm text-blue-700 mt-1">
                Les réparateurs avec un plan gratuit voient leurs informations masquées côté client (comme Doctolib). 
                Seuls les abonnés Basic+ ont accès aux fonctionnalités complètes.
              </p>
            </div>
          </div>
        </div>

        {/* Afficher directement le tableau des réparateurs comme dans AdminDashboard */}
        <RepairersTable
          repairers={repairers}
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
