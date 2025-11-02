import { Helmet } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSkeleton from '@/components/sections/HeroSkeleton';
import { StatsGridSkeleton, CardsGridSkeleton, BlogGridSkeleton } from '@/components/sections/LoadingSkeleton';

// Lazy load non-critical components for better FCP
const HeroWithIntegratedSearch = lazy(() => import('@/components/sections/HeroWithIntegratedSearch'));
const QuickStatsSection = lazy(() => import('@/components/sections/QuickStatsSection'));
const TrustSection = lazy(() => import('@/components/sections/TrustSection'));
const BlogSectionHomepage = lazy(() => import('@/components/sections/BlogSectionHomepage'));

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

      <main className="space-y-20 md:space-y-32">
        {/* Hero principal avec chargement optimisé */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroWithIntegratedSearch 
            onQuickSearch={() => {}}
            onMapSearch={() => {}}
          />
        </Suspense>

        {/* Sections en conteneur aéré - chargement différé */}
        <section className="container mx-auto px-4 md:px-8 lg:px-10">
          <Suspense fallback={<StatsGridSkeleton />}>
            <QuickStatsSection />
          </Suspense>
        </section>

        <section className="container mx-auto px-4 md:px-8 lg:px-10">
          <Suspense fallback={<CardsGridSkeleton />}>
            <TrustSection />
          </Suspense>
        </section>

        <section className="container mx-auto px-4 md:px-8 lg:px-10">
          <Suspense fallback={<BlogGridSkeleton />}>
            <BlogSectionHomepage />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;