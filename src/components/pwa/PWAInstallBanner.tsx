import React, { useState, useEffect } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DAYS = 7;

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, installApp, isInstalled, isIOS, isStandalone } = usePWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled || isStandalone) return;

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Only show if we have an install prompt (Android/desktop) or it's iOS
    if (!canInstall && !isIOS) return;

    // Delay appearance so it's not intrusive
    const timer = setTimeout(() => setVisible(true), 30000);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, isStandalone, isIOS]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    const accepted = await installApp();
    if (accepted) dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card shadow-lg p-4">
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <img src="/logo-icon.svg" alt="TopRéparateurs" className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Installer TopRéparateurs
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Accédez plus rapidement à vos réparateurs
                </p>
              </div>
              <button
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 -mt-1"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              /* iOS instructions */
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Share className="h-3.5 w-3.5" /> Partager
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Sur l'écran d'accueil
                </span>
              </div>
            ) : (
              /* Android / Desktop */
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={handleInstall}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Installer l'application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
