
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

  const iconSize = size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 56;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-3xl';

  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Background circle with gradient */}
          <circle cx="40" cy="40" r="35" fill="url(#modernGradient)" />
          
          {/* Mobile phone avec couleurs plus visibles */}
          <rect x="30" y="20" width="20" height="35" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1" />
          <rect x="32" y="24" width="16" height="24" rx="1" fill="#3B82F6" />
          <circle cx="40" cy="52" r="2" fill="#9CA3AF" />
          
          {/* Animated signal waves */}
          <g className="animate-pulse">
            <path d="M55 30C58 33 58 47 55 50" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M58 35C60 37 60 43 58 45" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
          
          {/* Repair tools animation */}
          <g className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
            <path d="M20 25L23 22L20 19" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <path d="M25 30L28 27L25 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          </g>
          
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
      {/* Animated mobile phone icon */}
      <div className="relative">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-110 drop-shadow-lg"
        >
          {/* Background circle with gradient */}
          <circle cx="40" cy="40" r="35" fill="url(#logoGradient)" />
          
          {/* Mobile phone avec couleurs foncées pour le contraste */}
          <rect x="30" y="20" width="20" height="35" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1.5" />
          <rect x="32" y="24" width="16" height="24" rx="1" fill="#3B82F6" />
          <circle cx="40" cy="52" r="2" fill="#9CA3AF" />
          
          {/* Écran avec reflet */}
          <rect x="33" y="25" width="14" height="22" rx="1" fill="#60A5FA" />
          <rect x="34" y="26" width="6" height="2" rx="1" fill="#93C5FD" opacity="0.8" />
          
          {/* Animated signal waves */}
          <g className="animate-pulse">
            <path d="M55 30C58 33 58 47 55 50" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M58 35C60 37 60 43 58 45" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M61 38C62 39 62 41 61 42" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
          
          {/* Repair tools animation - clé et tournevis */}
          <g className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
            <path d="M20 25L23 22L20 19" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M25 30L28 27L25 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="28" r="1.5" fill="#F59E0B" />
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
        <div className="flex items-baseline space-x-1">
          <span className={`${textSize} font-bold leading-tight`}>
            <span className="text-blue-600">Top</span>
            <span className="text-orange-600">Réparateurs</span>
          </span>
          <span className="text-sm text-gray-600">.fr</span>
        </div>
      ) : (
        <div className="flex items-baseline space-x-1">
          <span className={`${textSize} font-bold`}>
            <span className="text-blue-600">Top</span>
            <span className="text-orange-600">Réparateurs</span>
          </span>
          <span className="text-sm text-gray-600">.fr</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
