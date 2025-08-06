
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
    xxl: 'h-[220px]',
  };

  // Pour le variant 'icon', on affiche seulement le logo sans texte
  if (variant === 'icon') {
    return (
      <div className={`relative ${sizeClasses[size] || ''} ${className}`}>
        <img
          src="/lovable-uploads/4bdc75bf-a935-42b0-8ef6-086b5309086f.png"
          alt="TopRéparateurs.fr"
          className={`${sizeClasses[size] || ''} object-contain`}
        />
      </div>
    );
  }

  // Pour les autres variants, on affiche le logo complet
  return (
    <div className={`flex items-center justify-center ${sizeClasses[size] || ''} ${className}`}>
      <img
        src="/lovable-uploads/4bdc75bf-a935-42b0-8ef6-086b5309086f.png"
        alt="TopRéparateurs.fr"
        className={`${sizeClasses[size] || ''} object-contain`}
      />
    </div>
  );
};

export default Logo;
