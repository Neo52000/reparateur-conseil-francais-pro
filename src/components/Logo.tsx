
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const iconSize = size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 48;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-3xl';

  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`}>
        {/* Téléphone mobile animé */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-pulse"
        >
          {/* Background circle moderne */}
          <circle cx="30" cy="30" r="30" fill="url(#modernGradient)" />
          
          {/* Téléphone mobile */}
          <rect x="20" y="15" width="20" height="30" rx="4" fill="white" stroke="none" />
          <rect x="22" y="18" width="16" height="20" rx="1" fill="#1E40AF" />
          <circle cx="30" cy="42" r="2" fill="white" />
          
          {/* Effet de réparation/outils */}
          <path d="M35 12L38 15L35 18M25 12L22 15L25 18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" className="animate-bounce" />
          
          <defs>
            <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      {/* Téléphone mobile animé */}
      <div className="relative">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-110"
        >
          {/* Background moderne avec dégradé */}
          <circle cx="30" cy="30" r="30" fill="url(#logoGradient)" />
          
          {/* Téléphone mobile */}
          <rect x="20" y="15" width="20" height="30" rx="4" fill="white" stroke="none" />
          <rect x="22" y="18" width="16" height="20" rx="1" fill="#1E40AF" />
          <circle cx="30" cy="42" r="2" fill="white" />
          
          {/* Lignes de signal/wifi animées */}
          <g className="animate-pulse">
            <path d="M42 20C42 20 45 23 45 30C45 37 42 40 42 40" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M44 24C44 24 46 26 46 30C46 34 44 36 44 36" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
          
          {/* Effet de réparation */}
          <g className="animate-bounce" style={{ animationDelay: '0.5s' }}>
            <path d="M12 25L15 22L12 19M18 25L21 22L18 19" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          </g>
          
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="30%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text part */}
      {variant === 'full' ? (
        <div className="flex items-baseline">
          <span className={`${textSize} font-bold leading-tight`}>
            <span className="text-blue-600">Top</span>
            <span className="text-orange-600">Réparateurs</span>
          </span>
          <span className="text-sm text-gray-600 ml-1">.fr</span>
        </div>
      ) : (
        <div className="flex items-baseline">
          <span className={`${textSize} font-bold`}>
            <span className="text-blue-600">Top</span>
            <span className="text-orange-600">Réparateurs</span>
          </span>
          <span className="text-sm text-gray-600 ml-1">.fr</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
