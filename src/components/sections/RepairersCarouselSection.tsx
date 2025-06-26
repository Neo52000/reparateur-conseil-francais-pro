
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
      {/* Titre fixe pour éviter les sauts de page */}
      <div className="text-center mb-8 min-h-[120px] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Les derniers réparateurs validés
        </h2>
        <p className="text-gray-600">
          Réparateurs vérifiés et professionnels de confiance
        </p>
      </div>
      
      {/* Conteneur du carrousel avec hauteur minimale pour éviter les sauts */}
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
