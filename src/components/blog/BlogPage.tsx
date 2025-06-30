
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { useAuth } from '@/hooks/useAuth';
import BlogPostCard from './BlogPostCard';
import NewsletterSubscription from './NewsletterSubscription';
import { BlogPost } from '@/types/blog';

const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, fetchPosts } = useBlog();
  const { user, canAccessRepairer } = useAuth();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedVisibility, setSelectedVisibility] = useState(searchParams.get('visibility') || 'public');

  // Determine available visibility options based on user permissions
  const getVisibilityOptions = () => {
    const options = [
      { value: 'public', label: 'Articles publics' }
    ];
    
    if (canAccessRepairer) {
      options.push(
        { value: 'repairers', label: 'Articles réparateurs' },
        { value: 'both', label: 'Tous les articles' }
      );
    }
    
    return options;
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const filters: any = {
        limit: 12
      };
      
      if (selectedCategory) {
        filters.category = selectedCategory;
      }
      
      if (selectedVisibility === 'both') {
        // No visibility filter - show all
      } else {
        filters.visibility = selectedVisibility;
      }
      
      const data = await fetchPosts(filters);
      
      // Filter by search term if provided
      let filteredPosts = data;
      if (searchTerm) {
        filteredPosts = data.filter(post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, selectedVisibility]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedVisibility !== 'public') params.set('visibility', selectedVisibility);
    setSearchParams(params);
    
    loadPosts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedVisibility('public');
    setSearchParams({});
    loadPosts();
  };

  const activeFilters = [
    searchTerm && { type: 'search', value: searchTerm, label: `Recherche: ${searchTerm}` },
    selectedCategory && { type: 'category', value: selectedCategory, label: categories.find(c => c.id === selectedCategory)?.name },
    selectedVisibility !== 'public' && { type: 'visibility', value: selectedVisibility, label: getVisibilityOptions().find(o => o.value === selectedVisibility)?.label }
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Blog RepairHub</h1>
            <p className="text-lg text-gray-600 mt-2">
              Actualités, conseils et guides pour tous vos appareils
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold">Filtres</h3>
              
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Rechercher</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Mots-clés..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Type d'articles</label>
                <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getVisibilityOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active filters */}
              {activeFilters.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Filtres actifs</span>
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      Effacer
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {activeFilters.map((filter, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {filter.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Newsletter subscription */}
            <div className="mt-6">
              <NewsletterSubscription />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map(post => (
                  <BlogPostCard key={post.id} post={post} showVisibility={canAccessRepairer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche ou de supprimer certains filtres.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Effacer les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
