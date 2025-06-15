
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useRepairers } from '@/hooks/useRepairers';
import RepairerProfileModal from './RepairerProfileModal';
import RepairerCard from './repairers/RepairerCard';

interface RepairersListProps {
  compact?: boolean;
  filters?: any;
}

const RepairersList: React.FC<RepairersListProps> = ({ compact = false, filters }) => {
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { repairers, loading, error } = useRepairers(filters);

  // Logs pour le debugging
  console.log('RepairersList - Received repairers:', repairers);
  console.log('RepairersList - Repairers count:', repairers.length);
  console.log('RepairersList - Loading:', loading);
  console.log('RepairersList - Error:', error);

  const handleViewProfile = (repairerId: string) => {
    console.log('RepairersList - Opening profile for:', repairerId);
    setSelectedRepairerId(repairerId);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedRepairerId(null);
  };

  if (loading) {
    console.log('RepairersList - Rendering loading state');
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.log('RepairersList - Rendering error state:', error);
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-red-600">Erreur lors du chargement des réparateurs</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  console.log('RepairersList - Rendering main content');

  return (
    <>
      <div className="space-y-4">
        {compact && (
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {repairers.length} réparateurs trouvés
            </h3>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              Voir tout
            </Button>
          </div>
        )}

        {repairers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Aucun réparateur trouvé pour cette recherche</p>
              <p className="text-sm text-gray-400 mt-2">Essayez d'élargir vos critères de recherche</p>
            </CardContent>
          </Card>
        ) : (
          repairers.map((repairer, index) => {
            console.log(`RepairersList - Rendering repairer ${index + 1}:`, {
              id: repairer.id,
              name: repairer.name,
              city: repairer.city
            });
            
            return (
              <RepairerCard 
                key={repairer.id} 
                repairer={repairer} 
                compact={compact}
                onViewProfile={handleViewProfile}
              />
            );
          })
        )}

        {!compact && repairers.length > 0 && (
          <div className="text-center py-6">
            <Button variant="outline">
              Charger plus de résultats
            </Button>
          </div>
        )}
      </div>

      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfileModal}
          repairerId={selectedRepairerId}
        />
      )}
    </>
  );
};

export default RepairersList;
