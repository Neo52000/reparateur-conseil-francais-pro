import { Helmet } from 'react-helmet-async';
import HeroWithIntegratedSearch from '@/components/sections/HeroWithIntegratedSearch';
import BlogSectionHomepage from '@/components/sections/BlogSectionHomepage';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import TrustSection from '@/components/sections/TrustSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>TopRéparateurs - Trouvez le meilleur réparateur près de chez vous</title>
        <meta 
          name="description" 
          content="Trouvez rapidement un réparateur de confiance près de chez vous. Comparez les prix, consultez les avis et prenez rendez-vous en ligne." 
        />
        <meta name="keywords" content="réparateur, réparation, smartphone, tablette, ordinateur, dépannage" />
        <link rel="canonical" href="https://topreparateurs.fr" />
      </Helmet>

      {/* Ancienne page d'accueil rétablie avec intégration de la nouvelle carte via le modal */}
      <HeroWithIntegratedSearch 
        onQuickSearch={() => {}}
        onMapSearch={() => {}}
      />

      {/* Sections additionnelles de l'ancienne page d'accueil */}
      <QuickStatsSection />
      <TrustSection />
      <BlogSectionHomepage />
    </div>
  );
};

export default Index;