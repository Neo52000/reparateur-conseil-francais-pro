import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

const SubscriptionCanceledPage = () => (
  <>
    <Helmet>
      <title>Paiement annulé · TopRéparateurs</title>
      <meta name="robots" content="noindex,nofollow" />
    </Helmet>
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <XCircle className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Paiement annulé</h1>
        <p className="text-muted-foreground">
          Aucun débit n'a été effectué. Vous pouvez relancer la souscription à tout moment.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link to="/repairer-plans">Voir les abonnements</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  </>
);

export default SubscriptionCanceledPage;
