import React from "react"

// Hook de toast simplifié sans erreurs React
export function useToast() {
  // Version simplifiée sans état pour éviter les erreurs React
  const toast = ({ title, description }: { title: string; description?: string }) => {
    console.log(`Toast: ${title}${description ? ` - ${description}` : ''}`);
    // TODO: Implémenter un système de toast plus tard
  };

  return {
    toast,
    dismiss: () => {},
  };
}

// Types pour compatibilité
export type ToastActionElement = React.ReactElement;
export type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};