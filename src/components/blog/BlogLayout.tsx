
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

interface BlogLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonUrl?: string;
  backButtonText?: string;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ 
  children, 
  title = "Blog", 
  subtitle = "Nos derniers articles et conseils",
  showBackButton = true,
  backButtonUrl = "/",
  backButtonText = "Retour à l'accueil"
}) => {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navigation />
      <Helmet>
        <title>{`${title} | Blog TopRéparateurs`}</title>
        <meta name="description" content={subtitle} />
        <link rel="canonical" href="https://topreparateurs.fr/blog" />
      </Helmet>
      {/* Header avec navigation et image de fond */}
      <header className="relative bg-background border-b overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {showBackButton && (
            <Link to={backButtonUrl}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backButtonText}
              </Button>
            </Link>
          )}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6 tracking-tight">{title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{subtitle}</p>
          </div>
        </div>
        </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default BlogLayout;
