import { Helmet } from 'react-helmet-async';
import HeroWithIntegratedSearch from '@/components/sections/HeroWithIntegratedSearch';
import BlogSectionHomepage from '@/components/sections/BlogSectionHomepage';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import TrustSection from '@/components/sections/TrustSection';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>TopRéparateurs - Trouvez le meilleur réparateur près de chez vous</title>
        <meta 
          name="description" 
          content="Trouvez rapidement un réparateur de confiance près de chez vous. Comparez les prix, consultez les avis et prenez rendez-vous en ligne." 
        />
        <meta name="keywords" content="réparateur, réparation, smartphone, tablette, ordinateur, dépannage" />
        <link rel="canonical" href="https://topreparateurs.fr" />
      </Helmet>

      <header className="sticky top-0 z-50">
        <Navigation />
      </header>

      <main className="space-y-16 md:space-y-24">
        {/* Hero principal pleine largeur */}
        <HeroWithIntegratedSearch 
          onQuickSearch={() => {}}
          onMapSearch={() => {}}
        />

        {/* Sections en conteneur aéré */}
        <section className="container mx-auto px-4 md:px-6 lg:px-8">
          <QuickStatsSection />
        </section>

        <section className="container mx-auto px-4 md:px-6 lg:px-8">
          <TrustSection />
        </section>

        <section className="container mx-auto px-4 md:px-6 lg:px-8">
          <BlogSectionHomepage />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;