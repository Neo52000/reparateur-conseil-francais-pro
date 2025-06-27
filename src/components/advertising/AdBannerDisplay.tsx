
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

  console.log('AdBannerDisplay - placement:', placement);
  console.log('AdBannerDisplay - loading:', loading);
  console.log('AdBannerDisplay - currentBanner:', currentBanner);

  if (loading) {
    console.log('AdBannerDisplay - still loading');
    return (
      <div className={`w-full flex justify-center ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg" style={{ width: '728px', height: '90px' }}>
          <div className="h-full bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!currentBanner) {
    console.log('AdBannerDisplay - no banner available');
    return null;
  }

  const handleClick = () => {
    console.log('AdBannerDisplay - banner clicked:', currentBanner.id);
    trackClick(currentBanner.id);
    if (currentBanner.target_url) {
      window.open(currentBanner.target_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="relative group cursor-pointer" onClick={handleClick}>
        {/* Bannière */}
        <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          <img
            src={currentBanner.image_url}
            alt={currentBanner.title}
            className="object-cover"
            style={{ 
              maxHeight: '90px',
              minHeight: '90px',
              width: '728px'
            }}
            onLoad={() => console.log('Banner image loaded successfully')}
            onError={(e) => {
              console.error('Error loading banner image:', currentBanner.image_url);
              // En cas d'erreur, afficher un placeholder
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzI4IiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgNzI4IDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iNzI4IiBoZWlnaHQ9IjkwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjM2NCIgeT0iNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjczODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCI+QmFubmnDqHJlIHB1YmxpY2l0YWlyZTwvdGV4dD4KPC9zdmc+';
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
