import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Wrench, Shield, Clock, Euro, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { seoProgrammaticService, SeoProgrammaticPage } from '@/services/seoProgrammaticService';
import { ProgrammaticPageLayout } from './ProgrammaticPageLayout';
import { RepairerCard } from './RepairerCard';

interface PageContent {
  intro?: string;
  model?: string;
  brand?: string;
  city?: string;
  repairersCount?: number;
  repairerIds?: string[];
  commonRepairs?: string[];
  benefits?: string[];
}

/**
 * Page programmatique modèle + ville
 * Ex: /reparation-iphone-15-paris
 */
export function ModelCityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SeoProgrammaticPage | null>(null);
  const [repairers, setRepairers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      if (!slug) return;

      setLoading(true);
      const pageData = await seoProgrammaticService.getPageBySlug(slug);
      
      if (pageData) {
        setPage(pageData);
        
        // Charger les réparateurs
        const content = pageData.content as PageContent;
        if (content.city) {
          const { data } = await supabase
            .from('repairers')
            .select('id, name, city, address, rating, review_count, services, is_verified')
            .ilike('city', `%${content.city}%`)
            .eq('is_verified', true)
            .order('rating', { ascending: false })
            .limit(10);
          
          setRepairers(data || []);
        }
      }
      
      setLoading(false);
    }

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Page non trouvée</h1>
        <p className="text-muted-foreground mb-6">
          Cette page n'existe pas ou n'est plus disponible.
        </p>
        <Button asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  const content = page.content as PageContent;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <ProgrammaticPageLayout
      title={page.title}
      h1Title={page.h1_title || page.title}
      metaDescription={page.meta_description || ''}
      schemaOrg={page.schema_org as Record<string, unknown>}
      canonicalUrl={`${baseUrl}/${page.slug}`}
      breadcrumbs={[
        { label: `Réparateurs ${content.city}`, href: `/reparateurs-${content.city?.toLowerCase()}` },
        { label: `${content.brand}`, href: `/reparation-${content.brand?.toLowerCase()}-${content.city?.toLowerCase()}` },
        { label: content.model || '' }
      ]}
    >
      {/* Introduction */}
      <section className="mb-8">
        <p className="text-lg text-muted-foreground">
          {content.intro}
        </p>
      </section>

      {/* Stats rapides */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{repairers.length}</div>
            <div className="text-sm text-muted-foreground">Réparateurs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {page.average_rating?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Note moyenne</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">24h</div>
            <div className="text-sm text-muted-foreground">Réponse moyenne</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">6 mois</div>
            <div className="text-sm text-muted-foreground">Garantie</div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Liste des réparateurs */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">
            Meilleurs réparateurs {content.model} à {content.city}
          </h2>
          
          <div className="grid gap-4">
            {repairers.map((repairer) => (
              <RepairerCard
                key={repairer.id}
                id={repairer.id}
                name={repairer.name}
                city={repairer.city}
                address={repairer.address}
                rating={repairer.rating}
                reviewCount={repairer.review_count}
                services={repairer.services || []}
                isVerified={repairer.is_verified}
              />
            ))}
          </div>

          {repairers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Aucun réparateur trouvé pour le moment.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/recherche">Élargir la recherche</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Réparations courantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Réparations courantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(content.commonRepairs || []).map((repair, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">{repair}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Avantages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pourquoi nous choisir ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(content.benefits || []).map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-lg mb-2">
                Besoin d'une réparation ?
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Obtenez un devis gratuit en quelques minutes
              </p>
              <Button variant="secondary" asChild className="w-full">
                <Link to="/demande-devis">
                  Demander un devis
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Liens internes */}
      {page.internal_links && page.internal_links.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Voir aussi</h2>
          <div className="flex flex-wrap gap-2">
            {page.internal_links.map((link, index) => (
              <Button key={index} variant="outline" asChild size="sm">
                <Link to={link}>{link.replace(/^\//, '').replace(/-/g, ' ')}</Link>
              </Button>
            ))}
          </div>
        </section>
      )}
    </ProgrammaticPageLayout>
  );
}

export default ModelCityPage;
