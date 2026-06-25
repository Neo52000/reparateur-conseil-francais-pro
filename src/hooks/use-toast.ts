import { toast as sonnerToast } from "sonner";
import type { ReactNode } from "react";

/**
 * Proxy léger vers sonner pour préserver l'API legacy `useToast().toast({...})`
 * sans dépendre de @radix-ui/react-toast.
 *
 * Phase 4.2 : retrait de Radix toast au profit de sonner uniquement.
 */

interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  id?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function asString(value: ReactNode): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

export function toast(options: ToastOptions) {
  const title = asString(options.title) ?? "";
  const description = asString(options.description);
  const args = {
    description,
    duration: options.duration,
    id: options.id,
    action: options.action,
  };

  switch (options.variant) {
    case "destructive":
      return sonnerToast.error(title, args);
    case "success":
      return sonnerToast.success(title, args);
    case "warning":
      return sonnerToast.warning(title, args);
    default:
      return sonnerToast(title, args);
  }
}

export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    toasts: [] as never[],
  };
}
