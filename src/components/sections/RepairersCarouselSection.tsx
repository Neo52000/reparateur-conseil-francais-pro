
import React from 'react';
import RepairersCarousel from '@/components/RepairersCarousel';
import { Repairer } from '@/types/repairer';
import { usePriorityRepairers } from '@/hooks/usePriorityRepairers';

interface RepairersCarouselSectionProps {
  onViewProfile: (repairer: Repairer) => void;
  onCall: (phone: string) => void;
}

const RepairersCarouselSection: React.FC<RepairersCarouselSectionProps> = ({
  onViewProfile,
  onCall
}) => {
  const { repairers, loading } = usePriorityRepairers(20);

  // Si pas de réparateurs ou en cours de chargement, ne rien afficher du tout
  if (loading || repairers.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="min-h-[300px]">
        <RepairersCarousel 
          onViewProfile={onViewProfile}
          onCall={onCall}
        />
      </div>
    </div>
  );
};

export default RepairersCarouselSection;
