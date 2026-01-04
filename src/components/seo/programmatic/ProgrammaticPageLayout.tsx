import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProgrammaticPageLayoutProps {
  title: string;
  h1Title: string;
  metaDescription: string;
  schemaOrg?: Record<string, unknown>;
  canonicalUrl?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

/**
 * Layout de base pour les pages SEO programmatiques
 */
export function ProgrammaticPageLayout({
  title,
  h1Title,
  metaDescription,
  schemaOrg,
  canonicalUrl,
  breadcrumbs = [],
  children
}: ProgrammaticPageLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        
        {/* Schema.org */}
        {schemaOrg && (
          <script type="application/ld+json">
            {JSON.stringify(schemaOrg)}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="bg-muted/50 py-3 px-4" aria-label="Fil d'Ariane">
            <div className="container mx-auto">
              <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Accueil
                  </Link>
                </li>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4" />
                    <li>
                      {item.href ? (
                        <Link to={item.href} className="hover:text-primary transition-colors">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-foreground font-medium">{item.label}</span>
                      )}
                    </li>
                  </React.Fragment>
                ))}
              </ol>
            </div>
          </nav>
        )}

        {/* H1 Header */}
        <header className="bg-gradient-to-b from-primary/10 to-background py-8 px-4">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {h1Title}
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  );
}

export default ProgrammaticPageLayout;
