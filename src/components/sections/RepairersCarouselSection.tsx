
import React from 'react';
import RepairersCarousel from '@/components/RepairersCarousel';
import { Repairer } from '@/types/repairer';

interface RepairersCarouselSectionProps {
  onViewProfile: (repairer: Repairer) => void;
  onCall: (phone: string) => void;
}

const RepairersCarouselSection: React.FC<RepairersCarouselSectionProps> = ({
  onViewProfile,
  onCall
}) => {
  return (
    <div className="mb-12">
      {/* Conteneur du carrousel sans titre ni description */}
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
