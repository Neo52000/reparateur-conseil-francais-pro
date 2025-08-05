import React, { useState, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useSimpleAuth';
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
  const { user, profile } = useAuth();
  const { getSubscriptionTier } = useRepairerSubscriptions();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewTier, setPreviewTier] = useState<string | null>(null);

  const actualTier = user ? getSubscriptionTier(user.id) : 'free';
  const canPreview = profile?.role === 'admin' || user?.email === 'demo@demo.fr';
  const activeTier = isPreviewMode && previewTier ? previewTier : actualTier;

  const startPreview = (tier: string) => {
    if (!canPreview) return;
    setIsPreviewMode(true);
    setPreviewTier(tier);
  };

  const stopPreview = () => {
    setIsPreviewMode(false);
    setPreviewTier(null);
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
