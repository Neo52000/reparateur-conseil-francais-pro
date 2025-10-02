import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm hover:shadow-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm hover:shadow-md",
        outline: "text-foreground border-2 hover:bg-accent",
        success:
          "border-transparent bg-status-success text-white hover:bg-status-success/80 shadow-sm hover:shadow-md",
        warning:
          "border-transparent bg-status-warning text-foreground hover:bg-status-warning/80 shadow-sm",
        info:
          "border-transparent bg-info-badge text-info-badge-foreground hover:bg-info-badge/80 shadow-sm hover:shadow-md",
        glass:
          "bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-[var(--glass-border)] hover:bg-white/90 dark:hover:bg-white/20",
        premium:
          "border-transparent bg-gradient-to-r from-electric-blue to-vibrant-orange text-white shadow-md hover:shadow-lg hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
