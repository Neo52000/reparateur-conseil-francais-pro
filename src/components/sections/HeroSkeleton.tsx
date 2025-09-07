import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Lightweight hero skeleton for immediate FCP
 * Renders critical above-the-fold structure instantly
 */
const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative h-[70vh] bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-white px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center space-y-6">
          {/* Title skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full max-w-3xl mx-auto bg-white/20" />
            <Skeleton className="h-8 w-2/3 mx-auto bg-white/20" />
          </div>
          
          {/* Subtitle skeleton */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full bg-white/15" />
            <Skeleton className="h-6 w-3/4 mx-auto bg-white/15" />
          </div>

          {/* Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Skeleton className="h-14 w-48 bg-blue-600/50 rounded-xl" />
            <Skeleton className="h-14 w-52 bg-green-600/50 rounded-xl" />
            <Skeleton className="h-14 w-44 bg-white/20 rounded-xl" />
          </div>

          {/* Info box skeleton */}
          <div className="pt-4">
            <Skeleton className="h-16 w-80 mx-auto bg-blue-600/20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSkeleton;