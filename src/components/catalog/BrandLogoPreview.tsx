
import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface BrandLogoPreviewProps {
  logoUrl?: string;
  brandName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BrandLogoPreview: React.FC<BrandLogoPreviewProps> = ({ 
  logoUrl, 
  brandName, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!logoUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-md flex items-center justify-center ${className}`}>
        <Package className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-6 w-6'} text-gray-400`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {isLoading && (
        <div className={`${sizeClasses[size]} bg-gray-100 rounded-md flex items-center justify-center absolute inset-0`}>
          <Package className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-6 w-6'} text-gray-400`} />
        </div>
      )}
      <img
        src={logoUrl}
        alt={`Logo ${brandName}`}
        className={`${sizeClasses[size]} object-contain rounded-md`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default BrandLogoPreview;
