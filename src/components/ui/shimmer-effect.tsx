import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "premium" | "subtle";
  duration?: number;
}

const ShimmerEffect = React.forwardRef<HTMLDivElement, ShimmerEffectProps>(
  (
    { children, variant = "default", duration = 3, className, ...props },
    ref
  ) => {
    const variantStyles = {
      default: {
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
      },
      premium: {
        background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)",
      },
      subtle: {
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      },
    };

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {children}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={variantStyles[variant]}
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );
  }
);

ShimmerEffect.displayName = "ShimmerEffect";

export { ShimmerEffect };
