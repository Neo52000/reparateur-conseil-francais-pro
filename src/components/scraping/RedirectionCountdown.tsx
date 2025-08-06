import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface RedirectionCountdownProps {
  onRedirect: () => void;
  onCancel: () => void;
  duration?: number;
}

const RedirectionCountdown: React.FC<RedirectionCountdownProps> = ({
  onRedirect,
  onCancel,
  duration = 3
}) => {
  const [countdown, setCountdown] = useState(duration);

  useEffect(() => {
    if (countdown === 0) {
      onRedirect();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onRedirect]);

  return (
    <Card className="border-admin-green bg-admin-green-light/10">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-admin-green mr-3" />
          <h3 className="text-lg font-semibold text-admin-green">
            Scraping terminé avec succès !
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Redirection vers la gestion des réparateurs dans :
        </p>
        
        <div className="text-3xl font-bold text-admin-purple mb-4">
          {countdown}
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Button 
            onClick={onRedirect}
            variant="default"
            className="bg-admin-green hover:bg-admin-green/90"
          >
            Voir maintenant
          </Button>
          <Button 
            onClick={onCancel}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RedirectionCountdown;