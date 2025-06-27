
import React, { useEffect, useState } from 'react';
import { useAdvertising } from '@/hooks/useAdvertising';
import type { AdBanner } from '@/types/advertising';

interface AdBannerDisplayProps {
  targetType: 'client' | 'repairer';
  placement: string;
  className?: string;
}

const AdBannerDisplay: React.FC<AdBannerDisplayProps> = ({
  targetType,
  placement,
  className = ''
}) => {
  const [activeBanners, setActiveBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { getActiveBanners, recordImpression, recordClick } = useAdvertising();

  useEffect(() => {
    const loadBanners = async () => {
      const banners = await getActiveBanners(targetType, placement);
      setActiveBanners(banners);
      
      // Record impression for first banner
      if (banners.length > 0) {
        await recordImpression(banners[0].id, placement);
      }
    };

    loadBanners();
  }, [targetType, placement]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => {
        const nextIndex = (prev + 1) % activeBanners.length;
        // Record impression for next banner
        if (activeBanners[nextIndex]) {
          recordImpression(activeBanners[nextIndex].id, placement);
        }
        return nextIndex;
      });
    }, 15000); // Change banner every 15 seconds

    return () => clearInterval(interval);
  }, [activeBanners, placement]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentBannerIndex];

  const handleClick = async () => {
    await recordClick(currentBanner.id, placement);
    window.open(currentBanner.target_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`ad-banner-container ${className}`}>
      <div 
        className="cursor-pointer transition-opacity hover:opacity-90"
        onClick={handleClick}
        style={{ width: '728px', height: '90px' }}
      >
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          className="w-full h-full object-cover rounded border"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      {activeBanners.length > 1 && (
        <div className="flex justify-center mt-2 space-x-1">
          {activeBanners.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentBannerIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-1">
        Publicité
      </div>
    </div>
  );
};

export default AdBannerDisplay;
