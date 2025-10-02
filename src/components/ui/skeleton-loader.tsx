import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animated?: boolean;
  className?: string;
}

const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  (
    {
      variant = "rectangular",
      width,
      height,
      animated = true,
      className,
    },
    ref
  ) => {
    const variantClasses = {
      text: "h-4 rounded",
      circular: "rounded-full aspect-square",
      rectangular: "rounded-md",
      rounded: "rounded-lg",
    };

    const baseClasses = "bg-muted";

    const style = {
      width: width || undefined,
      height: height || undefined,
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(baseClasses, variantClasses[variant], className)}
          style={style}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], "animate-pulse", className)}
        style={style}
      />
    );
  }
);

SkeletonLoader.displayName = "SkeletonLoader";

// Composants préfabriqués
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("p-6 space-y-4", className)}>
    <SkeletonLoader variant="rounded" height={48} />
    <div className="space-y-2">
      <SkeletonLoader variant="text" />
      <SkeletonLoader variant="text" width="80%" />
      <SkeletonLoader variant="text" width="60%" />
    </div>
    <div className="flex gap-2">
      <SkeletonLoader variant="rounded" height={32} width={80} />
      <SkeletonLoader variant="rounded" height={32} width={80} />
    </div>
  </div>
);

export const SkeletonProfile = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-4", className)}>
    <SkeletonLoader variant="circular" width={48} height={48} />
    <div className="space-y-2 flex-1">
      <SkeletonLoader variant="text" width="40%" />
      <SkeletonLoader variant="text" width="60%" />
    </div>
  </div>
);

export const SkeletonTable = ({ 
  rows = 5, 
  className 
}: { 
  rows?: number; 
  className?: string 
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <SkeletonLoader variant="text" className="flex-1" />
        <SkeletonLoader variant="text" className="flex-1" />
        <SkeletonLoader variant="text" className="flex-1" />
      </div>
    ))}
  </div>
);

export { SkeletonLoader };
