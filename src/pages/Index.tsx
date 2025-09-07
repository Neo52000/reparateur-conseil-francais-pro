import { Helmet } from 'react-helmet-async';
import React, { Suspense, lazy } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSkeleton from '@/components/sections/HeroSkeleton';

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

      <main className="space-y-16 md:space-y-24">
        {/* Hero principal avec chargement optimisé */}
        <Suspense fallback={<HeroSkeleton />}>
          <HeroWithIntegratedSearch 
            onQuickSearch={() => {}}
            onMapSearch={() => {}}
          />
        </Suspense>

        {/* Sections en conteneur aéré - chargement différé */}
        <section className="container mx-auto px-4 md:px-6 lg:px-8">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          }>
            <QuickStatsSection />
          </Suspense>
        </section>

        <section className="container mx-auto px-4 md:px-6 lg:px-8">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          }>
            <TrustSection />
          </Suspense>
        </section>

        <section className="container mx-auto px-4 md:px-6 lg:px-8">
          <Suspense fallback={
            <div className="space-y-6">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          }>
            <BlogSectionHomepage />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;