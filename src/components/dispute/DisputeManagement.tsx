
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MessageSquare, RefreshCw, Shield } from 'lucide-react';
import { PaymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

interface DisputeManagementProps {
  quoteId: string;
  paymentIntentId: string;
  disputeReason?: string;
  status: 'active' | 'resolved' | 'escalated';
}

const DisputeManagement: React.FC<DisputeManagementProps> = ({
  quoteId,
  paymentIntentId,
  disputeReason,
  status
}) => {
  const [reason, setReason] = useState(disputeReason || '');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleRefund = async () => {
    try {
      setProcessing(true);
      
      const success = await PaymentService.refundPayment(paymentIntentId, reason);
      
      if (success) {
        toast({
          title: 'Remboursement effectué',
          description: 'Le remboursement a été traité avec succès.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter le remboursement.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Litige actif</Badge>;
      case 'resolved':
        return <Badge variant="default">Résolu</Badge>;
      case 'escalated':
        return <Badge variant="secondary">Escaladé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Gestion des litiges
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            RepairHub protège vos transactions. En cas de problème, nous médions pour trouver une solution équitable.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Motif du litige
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez le problème rencontré..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleRefund}
              disabled={processing || !reason.trim()}
              variant="destructive"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {processing ? 'Traitement...' : 'Demander un remboursement'}
            </Button>
            
            <Button variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contacter le support
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Processus de résolution</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Médiation entre les parties</li>
            <li>• Analyse des preuves fournies</li>
            <li>• Décision équitable sous 48h</li>
            <li>• Remboursement automatique si justifié</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisputeManagement;
