import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Users, Smartphone, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { seoProgrammaticService, SeoProgrammaticPage } from '@/services/seoProgrammaticService';
import { ProgrammaticPageLayout } from './ProgrammaticPageLayout';
import { RepairerCard } from './RepairerCard';

interface PageContent {
  city?: string;
  department?: string;
  region?: string;
  postalCodes?: string[];
  repairersCount?: number;
  topRepairerIds?: string[];
  popularBrands?: string[];
  popularModels?: string[];
  services?: string[];
  nearbyAreas?: string[];
}

/**
 * Page hub ville
 * Ex: /reparateurs-paris
 */
export function HubCityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SeoProgrammaticPage | null>(null);
  const [repairers, setRepairers] = useState<any[]>([]);
  const [filteredRepairers, setFilteredRepairers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      if (!slug) return;

      setLoading(true);
      const pageData = await seoProgrammaticService.getPageBySlug(slug);
      
      if (pageData) {
        setPage(pageData);
        
        const content = pageData.content as PageContent;
        if (content.city) {
          const { data } = await supabase
            .from('repairers')
            .select('id, name, city, address, rating, review_count, services, is_verified, phone')
            .ilike('city', `%${content.city}%`)
            .eq('is_verified', true)
            .order('rating', { ascending: false })
            .limit(20);
          
          setRepairers(data || []);
          setFilteredRepairers(data || []);
        }
      }
      
      setLoading(false);
    }

    loadPage();
  }, [slug]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = repairers.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.services || []).some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRepairers(filtered);
    } else {
      setFilteredRepairers(repairers);
    }
  }, [searchTerm, repairers]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
        { label: 'Réparateurs', href: '/recherche' },
        { label: content.city || '' }
      ]}
    >
      {/* Stats de la ville */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{repairers.length}</div>
            <div className="text-sm text-muted-foreground">Réparateurs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">
              {page.average_rating?.toFixed(1) || '4.5'}
            </div>
            <div className="text-sm text-muted-foreground">Note moyenne</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{(content.popularBrands || []).length}</div>
            <div className="text-sm text-muted-foreground">Marques</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{content.department || '-'}</div>
            <div className="text-sm text-muted-foreground">Département</div>
          </CardContent>
        </Card>
      </section>

      {/* Barre de recherche */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher un réparateur ou un service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar gauche - Filtres */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Marques populaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marques populaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(content.popularBrands || []).slice(0, 8).map((brand, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    asChild
                  >
                    <Link to={`/reparation-${brand.toLowerCase()}-${(content.city || '').toLowerCase()}`}>
                      {brand}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(content.services || [
                  'Réparation écran',
                  'Remplacement batterie',
                  'Connecteur de charge',
                  'Déblocage',
                  'Récupération données'
                ]).map((service, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    {service}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* Liste des réparateurs */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {filteredRepairers.length} réparateurs à {content.city}
            </h2>
          </div>

          <Tabs defaultValue="grid" className="mb-4">
            <TabsList>
              <TabsTrigger value="grid">Grille</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRepairers.map((repairer) => (
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
                    phone={repairer.phone}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredRepairers.map((repairer) => (
                  <Card key={repairer.id} className="overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <Link to={`/reparateur/${repairer.id}`}>
                          <h3 className="font-semibold hover:text-primary">
                            {repairer.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {repairer.address || repairer.city}
                        </p>
                      </div>
                      {repairer.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{repairer.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <Button asChild size="sm">
                        <Link to={`/reparateur/${repairer.id}`}>Voir</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredRepairers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Aucun réparateur trouvé pour cette recherche.
                </p>
                <Button onClick={() => setSearchTerm('')} className="mt-4">
                  Réinitialiser la recherche
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modèles populaires */}
      {(content.popularModels || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">
            Réparations populaires à {content.city}
          </h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {(content.popularModels || []).slice(0, 10).map((model, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link 
                    to={`/reparation-${model.toLowerCase().replace(/\s+/g, '-')}-${(content.city || '').toLowerCase()}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    Réparation {model}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Liens internes */}
      {page.internal_links && page.internal_links.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Pages associées</h2>
          <div className="flex flex-wrap gap-2">
            {page.internal_links.map((link, index) => (
              <Link key={index} to={link}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {link.replace(/^\//, '').replace(/-/g, ' ')}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </ProgrammaticPageLayout>
  );
}

export default HubCityPage;
