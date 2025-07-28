import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface BlurredProfileContentProps {
  profile: any;
  sectionTitle: string;
  isVisible: boolean;
  children: React.ReactNode;
}

const BlurredProfileContent: React.FC<BlurredProfileContentProps> = ({
  profile,
  sectionTitle,
  isVisible,
  children
}) => {
  if (isVisible) {
    return <>{children}</>;
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>{sectionTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="filter blur-sm pointer-events-none select-none opacity-40">
          {children}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Contenu masqué
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Ces informations sont disponibles uniquement pour les fiches revendiquées
            </p>
            <div className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium">
              <span>Appelez pour plus d'informations</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlurredProfileContent;