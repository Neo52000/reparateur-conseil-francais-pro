
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const iconSize = size === 'sm' ? 24 : size === 'md' ? 32 : 40;

  if (variant === 'icon') {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="20" fill="url(#iconGradient)" />
        
        {/* Wrench icon */}
        <path
          d="M15 12L28 25L25 28L12 15C12 13.9 12.9 13 14 13H15V12Z"
          fill="white"
          stroke="white"
          strokeWidth="1"
        />
        
        {/* Star for "Top" */}
        <path
          d="M20 8L21.5 11.5L25 10L23.5 13.5L27 15L23.5 16.5L25 20L21.5 18.5L20 22L18.5 18.5L15 20L16.5 16.5L13 15L16.5 13.5L15 10L18.5 11.5L20 8Z"
          fill="#F59E0B"
          stroke="#F59E0B"
          strokeWidth="0.5"
        />
        
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Icon part */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses[size]}
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="20" fill="url(#logoGradient)" />
        
        {/* Wrench icon */}
        <path
          d="M15 12L28 25L25 28L12 15C12 13.9 12.9 13 14 13H15V12Z"
          fill="white"
          stroke="white"
          strokeWidth="1"
        />
        
        {/* Star for "Top" */}
        <path
          d="M20 8L21.5 11.5L25 10L23.5 13.5L27 15L23.5 16.5L25 20L21.5 18.5L20 22L18.5 18.5L15 20L16.5 16.5L13 15L16.5 13.5L15 10L18.5 11.5L20 8Z"
          fill="#F59E0B"
          stroke="#F59E0B"
          strokeWidth="0.5"
        />
        
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Text part */}
      <div className="flex flex-col">
        {variant === 'full' ? (
          <>
            <span className="text-lg font-bold text-gray-900 leading-tight">
              <span className="text-blue-600">Top</span>
              <span className="text-orange-600">Réparateurs</span>
            </span>
            <span className="text-xs text-gray-600 -mt-1">.fr</span>
          </>
        ) : (
          <span className="text-lg font-bold text-gray-900">
            <span className="text-blue-600">Top</span>
            <span className="text-orange-600">Réparateurs</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
