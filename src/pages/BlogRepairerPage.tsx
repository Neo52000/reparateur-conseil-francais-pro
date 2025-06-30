
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import BlogLayout from '@/components/blog/BlogLayout';
import BlogPostList from '@/components/blog/BlogPostList';
import { useBlog } from '@/hooks/useBlog';
import { useAuth } from '@/hooks/useAuth';
import { BlogPost, BlogCategory } from '@/types/blog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

const BlogRepairerPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { fetchPosts, fetchCategories, loading } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Vérifier l'accès réparateur
  const hasRepairerAccess = user && (
    profile?.role === 'repairer' || 
    profile?.role === 'admin'
  );

  const loadPosts = async (reset = false) => {
    if (!hasRepairerAccess) return;

    const currentPage = reset ? 0 : page;
    const filters = {
      status: 'published',
      limit: 12,
      offset: currentPage * 12
    };

    const allPosts = await fetchPosts(filters);
    // Filtrer pour inclure 'repairers' et 'both'
    const filteredPosts = allPosts.filter(post => 
      post.visibility === 'repairers' || post.visibility === 'both'
    );
    
    if (reset) {
      setPosts(filteredPosts);
      setPage(1);
    } else {
      setPosts(prev => [...prev, ...filteredPosts]);
      setPage(prev => prev + 1);
    }
    
    setHasMore(filteredPosts.length === 12);
  };

  const loadCategories = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
  };

  useEffect(() => {
    if (hasRepairerAccess) {
      loadCategories();
      loadPosts(true);
    }
  }, [selectedCategory, hasRepairerAccess]);

  // Rediriger si pas d'accès
  if (!user) {
    return <Navigate to="/repairer-auth" replace />;
  }

  if (!hasRepairerAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Cette section est réservée aux réparateurs professionnels. 
              Veuillez vous connecter avec un compte réparateur pour accéder au contenu exclusif.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    console.log('Recherche réparateurs:', query);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleLoadMore = () => {
    loadPosts(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Blog Réparateur RepairFirst
          </h1>
          <p className="text-xl text-orange-100">
            Actualités, techniques et outils pour les professionnels de la réparation
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-700 text-orange-100">
              <Shield className="h-4 w-4 mr-2" />
              Contenu exclusif réparateurs
            </span>
          </div>
        </div>
      </div>

      <BlogLayout
        categories={categories}
        onSearch={handleSearch}
        onCategoryFilter={handleCategoryFilter}
        selectedCategory={selectedCategory}
      >
        <BlogPostList
          posts={posts}
          categories={categories}
          loading={loading}
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          selectedCategory={selectedCategory}
        />
      </BlogLayout>
    </div>
  );
};

export default BlogRepairerPage;
