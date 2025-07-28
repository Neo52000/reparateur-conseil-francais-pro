import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Blur } from 'lucide-react';
import EnhancedClaimBanner from './EnhancedClaimBanner';
import { RepairerProfile } from '@/types/repairerProfile';

interface BlurredProfileContentProps {
  profile: RepairerProfile;
  children: React.ReactNode;
  sectionTitle: string;
  isVisible: boolean;
}

const BlurredProfileContent: React.FC<BlurredProfileContentProps> = ({
  profile,
  children,
  sectionTitle,
  isVisible
}) => {
  if (isVisible) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Content avec effet de flou */}
      <div className="filter blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>
      
      {/* Overlay avec message de revendication */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-300">
        <Card className="bg-white shadow-lg border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-orange-600" />
              Contenu masqué
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 mb-2">
              {sectionTitle} disponible après revendication de la fiche
            </p>
            <div className="text-xs text-orange-600 font-medium">
              → Revendiquez cette fiche pour débloquer ce contenu
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlurredProfileContent;