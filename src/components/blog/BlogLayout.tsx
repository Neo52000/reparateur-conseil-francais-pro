
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {showBackButton && (
            <Link to={backButtonUrl}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backButtonText}
              </Button>
            </Link>
          )}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-lg text-gray-600">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  );
};

export default BlogLayout;
