import { FC } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

export const StatsGridSkeleton: FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-32" />
    ))}
  </div>
);

export const CardsGridSkeleton: FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-40" />
    ))}
  </div>
);

export const BlogGridSkeleton: FC = () => (
  <div className="space-y-8">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  </div>
);
