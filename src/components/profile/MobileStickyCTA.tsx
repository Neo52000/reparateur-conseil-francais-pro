import { Button } from '@/components/ui/button';
import { Phone, Calendar, MessageCircle } from 'lucide-react';

interface MobileStickyCTAProps {
  phone?: string | null;
  onCall: () => void;
  onBookAppointment: () => void;
  isPremium?: boolean;
}

/**
 * Barre d'action sticky en bas d'écran sur mobile (≤md).
 * Cachée sur desktop (md+).
 *
 * Le wrapper parent doit fournir `pb-24` ou `pb-32` pour éviter
 * que le contenu ne soit masqué par cette barre.
 */
export function MobileStickyCTA({
  phone,
  onCall,
  onBookAppointment,
  isPremium = false,
}: MobileStickyCTAProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md shadow-elev-2 md:hidden"
      role="region"
      aria-label="Actions rapides"
    >
      <div className="grid grid-cols-2 gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {phone && (
          <Button
            variant="outline"
            size="lg"
            onClick={onCall}
            className="w-full"
            aria-label={`Appeler ${phone}`}
          >
            <Phone className="mr-2 h-4 w-4" />
            Appeler
          </Button>
        )}
        <Button
          size="lg"
          onClick={onBookAppointment}
          className={phone ? 'w-full' : 'col-span-2 w-full'}
        >
          {isPremium ? (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Prendre RDV
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              Demander un devis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default MobileStickyCTA;
