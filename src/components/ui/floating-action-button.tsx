import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface FloatingActionButtonProps extends ButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  offset?: number;
  tooltip?: string;
}

const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(
  (
    {
      position = "bottom-right",
      offset = 24,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const positionClasses = {
      "bottom-right": `bottom-[${offset}px] right-[${offset}px]`,
      "bottom-left": `bottom-[${offset}px] left-[${offset}px]`,
      "top-right": `top-[${offset}px] right-[${offset}px]`,
      "top-left": `top-[${offset}px] left-[${offset}px]`,
    };

    const positionStyles = {
      "bottom-right": { bottom: offset, right: offset },
      "bottom-left": { bottom: offset, left: offset },
      "top-right": { top: offset, right: offset },
      "top-left": { top: offset, left: offset },
    };

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="fixed z-50"
        style={positionStyles[position]}
        title={tooltip}
      >
        <Button
          ref={ref}
          size="icon"
          variant="premium"
          className={cn(
            "h-14 w-14 rounded-full shadow-[var(--shadow-premium)]",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export { FloatingActionButton };
