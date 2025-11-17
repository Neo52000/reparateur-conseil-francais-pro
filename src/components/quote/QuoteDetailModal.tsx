import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Phone, Mail, Check, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';
import { MessageThread } from '@/components/messaging/MessageThread';
import { enhancedToast } from '@/components/ui/enhanced-toast';

interface Quote {
  id: string;
  device_brand: string;
  device_model: string;
  issue_type: string;
  issue_description: string;
  estimated_price?: number;
  estimated_duration?: string;
  repairer_notes?: string;
  status: string;
  created_at: string;
  repairer_id: string;
  repairer_name?: string;
}

interface QuoteDetailModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (quoteId: string) => void;
  onReject?: (quoteId: string) => void;
}

export const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({
  quote,
  isOpen,
  onClose,
  onAccept,
  onReject
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-status-warning/10 text-status-warning">En attente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-status-success/10 text-status-success">Accepté</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Refusé</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-status-success/10 text-status-success">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAccept = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    enhancedToast.success({
      title: 'Devis accepté !',
      description: 'Le réparateur a été notifié et va prendre contact avec vous',
    });
    onAccept?.(quote.id);
    setShowPayment(false);
    onClose();
  };

  const handleReject = () => {
    enhancedToast.info({
      title: 'Devis refusé',
      description: 'Le réparateur a été notifié',
    });
    onReject?.(quote.id);
    onClose();
  };

  if (showPayment && quote.estimated_price) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <StripePaymentForm
            paymentDetails={{
              amount: quote.estimated_price,
              serviceFee: Math.round(quote.estimated_price * 0.1),
              total: Math.round(quote.estimated_price * 1.1),
              description: `${quote.device_brand} ${quote.device_model} - ${quote.issue_type}`,
              repairerName: quote.repairer_name || 'Réparateur'
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (showMessaging) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <MessageThread
            threadId={quote.id}
            recipientName={quote.repairer_name || 'Réparateur'}
            recipientId={quote.repairer_id}
            onClose={() => setShowMessaging(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Détails du devis</DialogTitle>
              <DialogDescription>
                Demande créée le {format(new Date(quote.created_at), 'dd MMMM yyyy', { locale: fr })}
              </DialogDescription>
            </div>
            {getStatusBadge(quote.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations appareil */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Appareil</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Marque</p>
                <p className="font-medium">{quote.device_brand}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modèle</p>
                <p className="font-medium">{quote.device_model}</p>
              </div>
            </div>
          </div>

          {/* Problème */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Problème rencontré</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{quote.issue_type}</Badge>
              </div>
              <p className="text-muted-foreground">{quote.issue_description}</p>
            </div>
          </div>

          {/* Proposition du réparateur */}
          {quote.estimated_price && (
            <>
              <Separator />
              <div className="bg-primary/5 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Proposition du réparateur</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Durée estimée</span>
                    </div>
                    <p className="font-semibold text-lg">{quote.estimated_duration || '2-3 heures'}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm">Prix estimé</span>
                    </div>
                    <p className="font-semibold text-2xl text-primary">{quote.estimated_price}€</p>
                  </div>
                </div>

                {quote.repairer_notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Notes du réparateur</p>
                    <p className="text-sm">{quote.repairer_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Réparateur */}
          {quote.repairer_name && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-3">Réparateur</h3>
                <div className="space-y-2">
                  <p className="font-medium">{quote.repairer_name}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Paris 15ème
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      01 23 45 67 89
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      contact@reparateur.fr
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowMessaging(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contacter
            </Button>
            
            {quote.status === 'pending' && quote.estimated_price && (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReject}
                >
                  <X className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAccept}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accepter et payer
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
