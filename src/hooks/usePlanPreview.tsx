import { useState, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useRepairerSubscriptions } from './useRepairerSubscriptions';

interface PlanPreviewContextType {
  isPreviewMode: boolean;
  previewTier: string | null;
  actualTier: string;
  activeTier: string; // Le tier actuellement actif (preview ou réel)
  startPreview: (tier: string) => void;
  stopPreview: () => void;
  canPreview: boolean; // Admin ou démo
}

const PlanPreviewContext = createContext<PlanPreviewContextType | undefined>(undefined);

export const PlanPreviewProvider = ({ children }: { children: ReactNode }) => {
  console.log('🔍 PlanPreviewProvider - Composant monté');
  
  // TEMPORAIRE: Désactiver l'utilisation de useAuth pour éviter l'erreur
  /*
  const { user, profile } = useAuth();
  const { getSubscriptionTier } = useRepairerSubscriptions();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewTier, setPreviewTier] = useState<string | null>(null);

  const actualTier = user ? getSubscriptionTier(user.id) : 'free';
  const canPreview = profile?.role === 'admin' || user?.email === 'demo@demo.fr';
  const activeTier = isPreviewMode && previewTier ? previewTier : actualTier;
  */
  
  // Valeurs temporaires pour éviter l'erreur
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewTier, setPreviewTier] = useState<string | null>(null);
  const actualTier = 'free';
  const canPreview = false;
  const activeTier = isPreviewMode && previewTier ? previewTier : actualTier;

  const startPreview = (tier: string) => {
    console.log('🔍 startPreview - Désactivé temporairement');
    // TEMPORAIRE: Désactivé pour debug
    // if (!canPreview) return;
    // setIsPreviewMode(true);
    // setPreviewTier(tier);
  };

  const stopPreview = () => {
    console.log('🔍 stopPreview - Désactivé temporairement');
    // TEMPORAIRE: Désactivé pour debug
    // setIsPreviewMode(false);
    // setPreviewTier(null);
  };

  return (
    <PlanPreviewContext.Provider value={{
      isPreviewMode,
      previewTier,
      actualTier,
      activeTier,
      startPreview,
      stopPreview,
      canPreview,
    }}>
      {children}
    </PlanPreviewContext.Provider>
  );
};

export const usePlanPreview = () => {
  const context = useContext(PlanPreviewContext);
  if (context === undefined) {
    throw new Error('usePlanPreview must be used within a PlanPreviewProvider');
  }
  return context;
};