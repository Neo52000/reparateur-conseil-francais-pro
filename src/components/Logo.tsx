
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
    xxl: 'h-[220px]', // Beaucoup plus gros
  };

  // Adapter la taille de l'icône en fonction de la taille choisie (sm/md/lg/xl/xxl)
  const iconSize =
    size === 'sm'
      ? 32
      : size === 'md'
        ? 40
        : size === 'lg'
          ? 48
          : size === 'xl'
            ? 64
            : size === 'xxl'
              ? 220  // Logo xxl = 220px
              : 40;

  const textSize =
    size === 'sm'
      ? 'text-lg'
      : size === 'md'
        ? 'text-xl'
        : size === 'lg'
          ? 'text-2xl'
          : size === 'xl'
            ? 'text-3xl'
            : size === 'xxl'
              ? 'text-6xl'
              : 'text-xl';

  if (variant === 'icon') {
    return (
      <div className={`relative ${sizeClasses[size] || ''} ${className}`}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
          style={{ display: "block" }}
        >
          {/* Cercle de fond BLEU visible */}
          <circle cx="40" cy="40" r="38" fill="url(#modernGradient)" />
          {/* Mobile phone bien visible */}
          <rect x="28" y="18" width="24" height="40" rx="6" fill="#1F2937" stroke="#111827" strokeWidth="3"/>
          <rect x="32" y="24" width="16" height="26" rx="2" fill="#3B82F6"/>
          <circle cx="40" cy="52" r="2.7" fill="#F9FAFB"/>
          {/* Effet écran */}
          <rect x="34" y="27" width="12" height="13" rx="1" fill="#60A5FA" opacity="0.7"/>
          {/* Signal waves */}
          <g className="animate-pulse">
            <path d="M55 30C58 33 58 47 55 50" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M58 35C60 37 60 43 58 45" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </g>
          {/* Outils */}
          <g className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
            <path d="M22 29L25 26L22 23" stroke="#F59E0B" strokeWidth="2.3" strokeLinecap="round" />
            <circle cx="19.5" cy="27" r="1.5" fill="#F59E0B" />
          </g>
          <defs>
            <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-3 ${sizeClasses[size] || ''} ${className}`}>
      <div className="relative">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-110 drop-shadow-lg"
          style={{ display: "block" }}
        >
          {/* Cercle de fond BLEU */}
          <circle cx="40" cy="40" r="38" fill="url(#logoGradient)" />
          {/* Téléphone contrasté */}
          <rect x="28" y="18" width="24" height="40" rx="6" fill="#1F2937" stroke="#111827" strokeWidth="3"/>
          <rect x="32" y="24" width="16" height="26" rx="2" fill="#3B82F6"/>
          <circle cx="40" cy="52" r="2.7" fill="#F9FAFB"/>
          {/* Reflet écran */}
          <rect x="34" y="27" width="12" height="13" rx="1" fill="#60A5FA" opacity="0.7"/>
          {/* Animated signal waves */}
          <g className="animate-pulse">
            <path d="M55 30C58 33 58 47 55 50" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M58 35C60 37 60 43 58 45" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M61 38C62 39 62 41 61 42" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </g>
          {/* Outils - clé et tournevis */}
          <g className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
            <path d="M22 29L25 26L22 23" stroke="#F59E0B" strokeWidth="2.3" strokeLinecap="round" />
            <circle cx="19.5" cy="27" r="1.5" fill="#F59E0B" />
          </g>
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Texte */}
      <div className="flex items-baseline space-x-1">
        <span className={`${textSize} font-bold leading-tight`}>
          <span className="text-blue-600">Top</span>
          <span className="text-orange-600">Réparateurs</span>
        </span>
        <span className="text-sm text-gray-600">.fr</span>
      </div>
    </div>
  );
};

export default Logo;
