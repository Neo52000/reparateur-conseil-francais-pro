import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'table-row';
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  className,
  count = 1
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn('animate-pulse', className)}>
            <div className="rounded-lg border p-6 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={cn('animate-pulse space-y-2', className)}>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        );
      
      case 'avatar':
        return (
          <div className={cn('animate-pulse', className)}>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
        );
      
      case 'button':
        return (
          <div className={cn('animate-pulse', className)}>
            <div className="h-10 bg-gray-200 rounded-md w-24"></div>
          </div>
        );
      
      case 'table-row':
        return (
          <div className={cn('animate-pulse', className)}>
            <div className="flex space-x-4 py-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={cn('animate-pulse', className)}>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};