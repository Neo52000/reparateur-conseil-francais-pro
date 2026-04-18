import { Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RepairerStickyCTAProps {
  businessName?: string;
  hasPhone: boolean;
  onCall: () => void;
  onQuote: () => void;
}

const RepairerStickyCTA = ({ businessName, hasPhone, onCall, onQuote }: RepairerStickyCTAProps) => (
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
      <div className="flex gap-2">
        <Button
          onClick={onQuote}
          className="flex-1 h-11 shadow-elev-1"
          aria-label="Demander un devis gratuit"
        >
          <FileText className="h-4 w-4 mr-2" aria-hidden />
          Devis gratuit
        </Button>
        {hasPhone && (
          <Button
            onClick={onCall}
            variant="outline"
            className="h-11 px-4"
            aria-label="Appeler le réparateur"
          >
            <Phone className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default RepairerStickyCTA;
