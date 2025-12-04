import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Clock } from 'lucide-react';

interface DisabledFeaturePlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const DisabledFeaturePlaceholder: React.FC<DisabledFeaturePlaceholderProps> = ({
  title,
  description,
  icon
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full border-dashed border-2 border-muted bg-muted/30">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            {icon || <Lock className="h-8 w-8 text-muted-foreground" />}
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span>Fonction à venir</span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Cette fonctionnalité sera disponible dans une prochaine mise à jour.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisabledFeaturePlaceholder;
