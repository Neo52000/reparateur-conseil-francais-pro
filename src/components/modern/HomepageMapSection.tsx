import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomepageMapPreview = lazy(() => import('./HomepageMapPreview'));

const Placeholder = () => (
  <div
    className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-1 text-muted-foreground"
    role="status"
    aria-label="Aperçu de carte en cours de chargement"
  >
    <div className="flex flex-col items-center gap-2 text-sm">
      <MapPin className="h-6 w-6" aria-hidden />
      <span>Aperçu de la carte</span>
    </div>
  </div>
);

const Fallback = () => (
  <div
    className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-1"
    role="status"
    aria-live="polite"
  >
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Chargement de la carte…
    </div>
  </div>
);

const HomepageMapSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isVisible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="homepage-map-heading"
      className="py-12 md:py-16"
    >
      <div className="container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2
              id="homepage-map-heading"
              className="text-2xl md:text-3xl font-serif font-bold tracking-tight"
            >
              Explorez les réparateurs sur la carte
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              Repérez en un coup d'œil les professionnels certifiés autour de vous et ouvrez la carte complète pour affiner votre recherche.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-auto">
            <Link to="/search?view=map" aria-label="Voir toute la carte des réparateurs">
              Voir toute la carte
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="h-[320px] md:h-[400px] overflow-hidden rounded-2xl border border-border shadow-elev-3">
          {isVisible ? (
            <Suspense fallback={<Fallback />}>
              <HomepageMapPreview />
            </Suspense>
          ) : (
            <Placeholder />
          )}
        </div>
      </div>
    </section>
  );
};

export default HomepageMapSection;
