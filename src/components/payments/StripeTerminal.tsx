import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  client_secret?: string;
}

interface TerminalReader {
  id: string;
  label: string;
  status: 'online' | 'offline';
  device_type: string;
  location: string;
}

export const StripeTerminal: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [readers, setReaders] = useState<TerminalReader[]>([]);
  const [selectedReader, setSelectedReader] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    initializeTerminal();
    loadReaders();
  }, []);

  const initializeTerminal = async () => {
    try {
      setTerminalStatus('connecting');
      
      // En production, utiliser Stripe Terminal SDK
      // Pour la démo, simuler la connexion
      console.log('🔄 Initialisation Stripe Terminal...');
      
      // Simuler le chargement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTerminalStatus('connected');
      toast({
        title: "Terminal connecté",
        description: "Stripe Terminal est prêt à accepter les paiements"
      });
    } catch (error) {
      console.error('Erreur initialisation terminal:', error);
      setTerminalStatus('disconnected');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au terminal de paiement",
        variant: "destructive"
      });
    }
  };

  const loadReaders = async () => {
    try {
      // En production, récupérer les vrais readers Stripe
      // Pour la démo, utiliser des données simulées
      const mockReaders: TerminalReader[] = [
        {
          id: 'tmr_simulated_1',
          label: 'Terminal Principal - Caisse 1',
          status: 'online',
          device_type: 'chipper_2x',
          location: 'Boutique'
        },
        {
          id: 'tmr_simulated_2',
          label: 'Terminal Mobile - Réparation',
          status: 'online',
          device_type: 'chipper_1x',
          location: 'Atelier'
        }
      ];
      
      setReaders(mockReaders);
      if (mockReaders.length > 0) {
        setSelectedReader(mockReaders[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement readers:', error);
    }
  };

  const createPaymentIntent = async () => {
    if (!amount || !user) {
      toast({
        title: "Montant requis",
        description: "Veuillez saisir un montant pour le paiement",
        variant: "destructive"
      });
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (amountInCents < 50) {
      toast({
        title: "Montant trop faible",
        description: "Le montant minimum est de 0,50 €",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: amountInCents,
          currency: 'eur',
          payment_method_types: ['card_present'],
          capture_method: 'automatic',
          metadata: {
            source: 'pos_terminal',
            user_id: user.id
          }
        }
      });

      if (error) throw error;

      setPaymentIntent(data);
      toast({
        title: "Paiement initialisé",
        description: "Présentez la carte au terminal pour effectuer le paiement"
      });
    } catch (error) {
      console.error('Erreur création payment intent:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le paiement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processTerminalPayment = async () => {
    if (!paymentIntent || !selectedReader) return;

    setLoading(true);
    try {
      // En production, utiliser Stripe Terminal pour traiter le paiement
      console.log('💳 Traitement paiement terminal:', {
        paymentIntentId: paymentIntent.id,
        readerId: selectedReader,
        amount: paymentIntent.amount
      });

      // Simuler le processus de paiement
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simuler un paiement réussi
      const updatedIntent = {
        ...paymentIntent,
        status: 'succeeded' as const
      };
      setPaymentIntent(updatedIntent);

      // Enregistrer la transaction (si la table existe et avec les bons champs)
      try {
        const { error: transactionError } = await (supabase as any)
          .from('pos_transactions')
          .insert({
            total_amount: paymentIntent.amount / 100,
            payment_method: 'card_present',
            payment_status: 'completed',
            transaction_date: new Date().toISOString(),
            items: [{
              name: 'Paiement terminal',
              quantity: 1,
              price: paymentIntent.amount / 100
            }]
          });

        if (transactionError) {
          console.error('Erreur enregistrement transaction:', transactionError);
        }
      } catch (error) {
        console.warn('Table pos_transactions non disponible:', error);
      }

      toast({
        title: "Paiement réussi",
        description: `Paiement de ${(paymentIntent.amount / 100).toFixed(2)} € accepté`
      });
    } catch (error) {
      console.error('Erreur traitement paiement:', error);
      setPaymentIntent(prev => prev ? { ...prev, status: 'failed' } : null);
      toast({
        title: "Paiement échoué",
        description: "Le paiement n'a pas pu être traité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = () => {
    setPaymentIntent(null);
    setAmount('');
    toast({
      title: "Paiement annulé",
      description: "La transaction a été annulée"
    });
  };

  const resetTransaction = () => {
    setPaymentIntent(null);
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Statut du terminal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Terminal de paiement Stripe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                terminalStatus === 'connected' ? 'bg-green-500' :
                terminalStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="font-medium">
                {terminalStatus === 'connected' ? 'Connecté' :
                 terminalStatus === 'connecting' ? 'Connexion...' :
                 'Déconnecté'}
              </span>
            </div>
            
            {terminalStatus === 'disconnected' && (
              <Button onClick={initializeTerminal} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconnecter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sélection du lecteur */}
      {readers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lecteurs de cartes disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readers.map(reader => (
                <div
                  key={reader.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReader === reader.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReader(reader.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{reader.label}</p>
                      <p className="text-sm text-gray-600">{reader.location}</p>
                    </div>
                    <Badge variant={reader.status === 'online' ? 'default' : 'secondary'}>
                      {reader.status === 'online' ? 'En ligne' : 'Hors ligne'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interface de paiement */}
      {!paymentIntent ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Montant (€)</label>
              <Input
                type="number"
                step="0.01"
                min="0.50"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading || terminalStatus !== 'connected'}
              />
            </div>
            
            <Button
              onClick={createPaymentIntent}
              disabled={loading || !amount || terminalStatus !== 'connected'}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initialisation...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Initier le paiement
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {paymentIntent.status === 'succeeded' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : paymentIntent.status === 'failed' ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Smartphone className="w-5 h-5 text-blue-600" />
              )}
              Paiement - {(paymentIntent.amount / 100).toFixed(2)} €
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant={
                paymentIntent.status === 'succeeded' ? 'default' :
                paymentIntent.status === 'failed' ? 'destructive' :
                'secondary'
              }>
                {paymentIntent.status === 'succeeded' ? 'Paiement réussi' :
                 paymentIntent.status === 'failed' ? 'Paiement échoué' :
                 paymentIntent.status === 'processing' ? 'Traitement en cours...' :
                 'En attente'}
              </Badge>
            </div>

            {paymentIntent.status === 'pending' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Demandez au client de présenter sa carte au terminal pour finaliser le paiement.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {paymentIntent.status === 'pending' && (
                <>
                  <Button
                    onClick={processTerminalPayment}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Traiter le paiement
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={cancelPayment}
                    variant="outline"
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                </>
              )}
              
              {(paymentIntent.status === 'succeeded' || paymentIntent.status === 'failed') && (
                <Button onClick={resetTransaction} className="w-full">
                  Nouveau paiement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StripeTerminal;