import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, HelpCircle, ChevronRight, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { seoProgrammaticService, SeoProgrammaticPage } from '@/services/seoProgrammaticService';
import { ProgrammaticPageLayout } from './ProgrammaticPageLayout';

interface PageContent {
  symptom?: string;
  category?: string;
  city?: string;
  description?: string;
  solutions?: string[];
  relatedSymptoms?: string[];
  diagnosticSteps?: string[];
  faq?: Array<{ question: string; answer: string }>;
}

/**
 * Page symptôme/problème
 * Ex: /ecran-casse, /ecran-casse-paris
 */
export function SymptomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SeoProgrammaticPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      if (!slug) return;

      setLoading(true);
      const pageData = await seoProgrammaticService.getPageBySlug(slug);
      setPage(pageData);
      setLoading(false);
    }

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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
  const cityText = content.city ? ` à ${content.city}` : '';

  return (
    <ProgrammaticPageLayout
      title={page.title}
      h1Title={page.h1_title || page.title}
      metaDescription={page.meta_description || ''}
      schemaOrg={page.schema_org as Record<string, unknown>}
      canonicalUrl={`${baseUrl}/${page.slug}`}
      breadcrumbs={[
        { label: 'Problèmes', href: '/problemes' },
        { label: content.category || 'Réparation' },
        { label: content.symptom || '' }
      ]}
    >
      {/* Introduction */}
      <section className="mb-8">
        <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Symptôme identifié : {content.symptom}
            </h2>
            <p className="text-amber-700 dark:text-amber-300">
              {content.description}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Solutions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Solutions possibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {(content.solutions || []).map((solution, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
                  >
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-green-700 dark:text-green-300" />
                    </div>
                    <span className="text-sm font-medium">{solution}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Étapes de diagnostic */}
          {(content.diagnosticSteps || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comment diagnostiquer ce problème ?</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {(content.diagnosticSteps || []).map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="pt-1">
                        <p className="text-foreground">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* FAQ */}
          {(content.faq || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Questions fréquentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {(content.faq || []).map((item, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* CTA réparation */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">
                Réparez votre téléphone{cityText}
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Trouvez un réparateur qualifié près de chez vous
              </p>
              <Button variant="secondary" asChild className="w-full">
                <Link to={content.city ? `/reparateurs-${content.city.toLowerCase()}` : '/recherche'}>
                  Trouver un réparateur
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Problèmes similaires */}
          {(content.relatedSymptoms || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Problèmes similaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(content.relatedSymptoms || []).map((symptom, index) => (
                    <li key={index}>
                      <Link 
                        to={`/${symptom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                        {symptom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Catégorie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {content.category || 'Réparation'}
              </Badge>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Liens internes */}
      {page.internal_links && page.internal_links.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Pages liées</h2>
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

export default SymptomPage;
