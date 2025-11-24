import { Helmet } from 'react-helmet-async';
import ModernHeader from '@/components/modern/ModernHeader';
import ModernHero from '@/components/modern/ModernHero';
import TrustSignals from '@/components/modern/TrustSignals';
import RepairerResultsGrid from '@/components/modern/RepairerResultsGrid';
import ModernFooter from '@/components/modern/ModernFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>TopRéparateurs - Trouvez le meilleur réparateur près de chez vous</title>
        <meta 
          name="description" 
          content="Comparateur gratuit de réparateurs de smartphones, tablettes et consoles. Trouvez rapidement un professionnel certifié près de chez vous." 
        />
        <meta name="keywords" content="réparateur, réparation, smartphone, tablette, console, dépannage, certifié" />
        <link rel="canonical" href="https://topreparateurs.fr" />
      </Helmet>

      {/* Header minimaliste sticky */}
      <ModernHeader />

      <main>
        {/* Hero avec glassmorphism search */}
        <ModernHero />

        {/* Trust Signals */}
        <TrustSignals />

        {/* Résultats réparateurs en grille */}
        <RepairerResultsGrid />
      </main>

      {/* Footer simple */}
      <ModernFooter />
    </div>
  );
};

export default Index;