import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StaticPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  updated_at: string;
}

const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<StaticPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPageData = async () => {
      try {
        const { data, error }: { data: any, error: any } = await supabase
          .from('static_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Page non trouvée');
        } else {
          setPageData(data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la page:', err);
        setError('Erreur lors du chargement de la page');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/2 mb-6" />
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              {error || 'Page non trouvée'}
            </h1>
            <p className="text-muted-foreground">
              La page que vous cherchez n'existe pas ou n'est pas disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta tags */}
      <title>{pageData.meta_title || pageData.title}</title>
      <meta name="description" content={pageData.meta_description || ''} />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-8">{pageData.title}</h1>
            
            <Card>
              <CardContent className="pt-6">
                <div 
                  className="prose prose-lg max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: pageData.content }}
                />
                
                <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
                  Dernière mise à jour : {new Date(pageData.updated_at).toLocaleDateString('fr-FR')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaticPage;