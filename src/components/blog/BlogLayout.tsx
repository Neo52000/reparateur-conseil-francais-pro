
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Users, Rss } from 'lucide-react';
import { BlogCategory } from '@/types/blog';

interface BlogLayoutProps {
  children: React.ReactNode;
  categories?: BlogCategory[];
  onSearch?: (query: string) => void;
  onCategoryFilter?: (categoryId: string | null) => void;
  selectedCategory?: string | null;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({
  children,
  categories = [],
  onSearch,
  onCategoryFilter,
  selectedCategory
}) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const isClientSection = location.pathname.includes('/clients');
  const isRepairerSection = location.pathname.includes('/repairers');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du blog */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Blog RepairFirst
              </h1>
              <p className="text-xl text-gray-600">
                Actualités, conseils et expertise en réparation
              </p>
            </div>

            {/* Navigation des sections */}
            <div className="flex justify-center space-x-4 mb-6">
              <Link to="/blog">
                <Button 
                  variant={!isClientSection && !isRepairerSection ? "default" : "outline"}
                  className="flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Tous les articles
                </Button>
              </Link>
              <Link to="/blog/clients">
                <Button 
                  variant={isClientSection ? "default" : "outline"}
                  className="flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Section Clients
                </Button>
              </Link>
              <Link to="/blog/repairers">
                <Button 
                  variant={isRepairerSection ? "default" : "outline"}
                  className="flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Section Réparateurs
                </Button>
              </Link>
            </div>

            {/* Barre de recherche */}
            {onSearch && (
              <form onSubmit={handleSearch} className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher des articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar avec catégories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Catégories</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onCategoryFilter?.(null)}
                >
                  Toutes les catégories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onCategoryFilter?.(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Newsletter</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Recevez nos derniers articles directement dans votre boîte mail
                </p>
                <Button className="w-full" size="sm">
                  <Rss className="h-4 w-4 mr-2" />
                  S'abonner
                </Button>
              </div>
            </div>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BlogLayout;
