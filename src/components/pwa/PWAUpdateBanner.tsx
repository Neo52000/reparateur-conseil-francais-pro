import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export const PWAUpdateBanner: React.FC = () => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))] animate-in slide-in-from-top duration-500">
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-card shadow-lg p-3 flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-foreground flex-1">
          Nouvelle version disponible
        </p>
        <Button size="sm" variant="default" onClick={updateApp}>
          Mettre à jour
        </Button>
      </div>
    </div>
  );
};
