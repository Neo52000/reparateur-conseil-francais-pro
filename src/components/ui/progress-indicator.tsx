import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error" | "premium";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  (
    {
      value,
      max = 100,
      variant = "default",
      showLabel = false,
      size = "md",
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantColors = {
      default: "bg-primary",
      success: "bg-status-success",
      warning: "bg-status-warning",
      error: "bg-status-error",
      premium: "bg-gradient-to-r from-electric-blue to-vibrant-orange",
    };

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        
        <div
          className={cn(
            "w-full bg-secondary rounded-full overflow-hidden",
            sizeClasses[size]
          )}
        >
          {animated ? (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full transition-all duration-300",
                variantColors[variant],
                variant === "premium" && "shadow-[var(--shadow-glow)]"
              )}
            />
          ) : (
            <div
              style={{ width: `${percentage}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-300",
                variantColors[variant],
                variant === "premium" && "shadow-[var(--shadow-glow)]"
              )}
            />
          )}
        </div>
      </div>
    );
  }
);

ProgressIndicator.displayName = "ProgressIndicator";

export { ProgressIndicator };
