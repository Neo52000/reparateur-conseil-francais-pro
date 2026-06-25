import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

/**
 * Page d'atterrissage après checkout Stripe réussi.
 *
 * Stripe redirige vers `/subscription-success?session_id=cs_test_...` ;
 * le webhook `stripe-webhooks` met à jour `repairer_subscriptions`
 * de manière asynchrone. Ici on affiche un état d'attente puis confirme
 * dès que la souscription apparaît côté DB (poll court).
 */
const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'timeout'>('pending');

  useEffect(() => {
    if (!sessionId) {
      setStatus('timeout');
      return;
    }

    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('repairer_subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

      return Boolean(data);
    };

    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(async () => {
      attempts += 1;
      const confirmed = await checkSubscription();
      if (confirmed) {
        setStatus('confirmed');
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        setStatus('timeout');
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <>
      <Helmet>
        <title>Abonnement confirmé · TopRéparateurs</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {status === 'pending' && (
            <>
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
              <h1 className="text-2xl font-bold">Confirmation en cours…</h1>
              <p className="text-muted-foreground">
                Votre paiement est validé par Stripe. Nous activons votre abonnement.
              </p>
            </>
          )}
          {status === 'confirmed' && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
              <h1 className="text-2xl font-bold">Abonnement activé</h1>
              <p className="text-muted-foreground">
                Bienvenue dans TopRéparateurs. Vous pouvez maintenant accéder à votre tableau de bord.
              </p>
              <Button asChild className="w-full">
                <Link to="/repairer-dashboard">Accéder au dashboard</Link>
              </Button>
            </>
          )}
          {status === 'timeout' && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-amber-500" />
              <h1 className="text-2xl font-bold">Paiement reçu</h1>
              <p className="text-muted-foreground">
                Votre paiement est confirmé par Stripe mais l'activation prend un peu plus de temps que prévu.
                Vous recevrez un email dès que votre abonnement sera actif.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/repairer-dashboard">Aller au dashboard</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SubscriptionSuccessPage;
