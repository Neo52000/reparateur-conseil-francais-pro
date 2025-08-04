import React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
}

/**
 * Composant Progress simplifié pour éviter les erreurs Radix UI
 */
export const Progress: React.FC<ProgressProps> = ({ value = 0, className = '' }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`w-full bg-muted rounded-full h-2 ${className}`}>
      <div 
        className="bg-primary h-full rounded-full transition-all duration-300"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};