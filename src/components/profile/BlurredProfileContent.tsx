import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlurredProfileContentProps {
  profile: any;
  sectionTitle: string;
  isVisible: boolean;
  children: React.ReactNode;
  customMessage?: string;
  upgradeLink?: string;
  minPlan?: string;
}

const BlurredProfileContent: React.FC<BlurredProfileContentProps> = ({
  profile,
  sectionTitle,
  isVisible,
  children,
  customMessage,
  upgradeLink,
  minPlan = 'Visibilité'
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
        
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
          <div className="text-center p-6 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Contenu réservé
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {customMessage || `Ces informations sont disponibles à partir du plan ${minPlan}`}
            </p>
            {upgradeLink ? (
              <Button size="sm" className="gap-2" asChild>
                <a href={upgradeLink}>
                  Passer au plan {minPlan}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Contactez le réparateur pour plus d'informations
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlurredProfileContent;