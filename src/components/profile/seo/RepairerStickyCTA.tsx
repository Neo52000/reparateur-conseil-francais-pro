import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepairerStickyCTAProps {
  businessName?: string;
  hasPhone: boolean;
  onCall: () => void;
}

const RepairerStickyCTA = ({ businessName, hasPhone, onCall }: RepairerStickyCTAProps) => (
  <div
    className="fixed bottom-16 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur shadow-elev-3"
    role="region"
    aria-label="Actions rapides"
  >
    <div className="px-4 py-3">
      {businessName && (
        <p className="text-xs text-muted-foreground mb-2 truncate">
          Contacter <span className="font-medium text-foreground">{businessName}</span>
        </p>
      )}
      {hasPhone && (
        <Button
          onClick={onCall}
          className="w-full h-11 shadow-elev-1"
          aria-label="Appeler le réparateur"
        >
          <Phone className="h-4 w-4 mr-2" aria-hidden />
          Appeler
        </Button>
      )}
    </div>
  </div>
);

export default RepairerStickyCTA;
