import { useState, useEffect, useCallback } from 'react';
import { skipWaitingAndReload } from '@/swRegistration';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true);

  useEffect(() => {
    setIsInstalled(isStandalone);

    // Network status
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Install prompt (Android / desktop Chrome)
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Already installed
    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', handleInstalled);

    // SW update available
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, [isStandalone]);

  const installApp = useCallback(async () => {
    if (!installPrompt) return false;
    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setCanInstall(false);
      setInstallPrompt(null);
      return true;
    }
    return false;
  }, [installPrompt]);

  const updateApp = useCallback(() => {
    skipWaitingAndReload();
  }, []);

  return {
    isOnline,
    isInstalled,
    canInstall,
    installApp,
    updateAvailable,
    updateApp,
    isIOS,
    isStandalone,
  };
}
