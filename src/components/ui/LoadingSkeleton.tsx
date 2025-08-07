import React from 'react';
import { Card } from '@/components/ui/card';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'list' | 'map' | 'search';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '',
  variant = 'card',
  count = 3
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'map':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-96 bg-muted rounded-lg mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded w-3/4"></div>
              ))}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className={`animate-pulse space-y-4 ${className}`}>
            <div className="h-12 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                  <div className="h-8 w-20 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'card':
      default:
        return (
          <div className={`space-y-6 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
    }
  };

  return <div className="w-full">{renderSkeleton()}</div>;
};

export default LoadingSkeleton;