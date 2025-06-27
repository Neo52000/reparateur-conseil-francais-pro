
import React from 'react';
import { AdPlacement } from '@/types/advertising';
import { useAdvertising } from '@/hooks/useAdvertising';
import { ExternalLink } from 'lucide-react';

interface AdBannerDisplayProps {
  placement: AdPlacement;
  className?: string;
}

const AdBannerDisplay: React.FC<AdBannerDisplayProps> = ({ 
  placement, 
  className = '' 
}) => {
  const { currentBanner, loading, trackClick } = useAdvertising(placement);

  if (loading || !currentBanner) {
    return null;
  }

  const handleClick = () => {
    trackClick(currentBanner.id);
    if (currentBanner.target_url) {
      window.open(currentBanner.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative group cursor-pointer" onClick={handleClick}>
        {/* Indicateur "Publicité" */}
        <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded z-10">
          Publicité
        </div>
        
        {/* Bannière */}
        <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title}
            className="w-full h-auto object-cover"
            style={{ 
              maxHeight: '90px',
              minHeight: '60px'
            }}
            onError={(e) => {
              console.error('Error loading banner image:', currentBanner.image_url);
              // En cas d'erreur, cacher la bannière
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
          
          {/* Overlay avec icône au survol */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
            <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>

        {/* Titre de la bannière (optionnel, masqué par défaut) */}
        {currentBanner.title && (
          <div className="sr-only">
            {currentBanner.title}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBannerDisplay;
