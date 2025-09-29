import { Helmet } from 'react-helmet-async';
import { FileText, UserCheck, Shield, AlertCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>CGU | TopRéparateurs.fr</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
          <section className="bg-card p-6 rounded-lg border mb-6">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
            <p className="text-muted-foreground">
              En utilisant TopRéparateurs.fr, vous acceptez les présentes CGU.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
