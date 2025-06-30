
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import BlogPostCard from './BlogPostCard';
import { BlogPost, BlogCategory } from '@/types/blog';

interface BlogPostListProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (categoryId: string | null) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  selectedCategory?: string | null;
}

const BlogPostList: React.FC<BlogPostListProps> = ({
  posts,
  categories,
  loading = false,
  onSearch,
  onCategoryFilter,
  onLoadMore,
  hasMore = false,
  selectedCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'mostViewed'>('newest');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.share_count + b.comment_count) - (a.share_count + a.comment_count);
      case 'mostViewed':
        return b.view_count - a.view_count;
      case 'newest':
      default:
        return new Date(b.published_at || b.created_at).getTime() - 
               new Date(a.published_at || a.created_at).getTime();
    }
  });

  const handleShare = (post: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: `${window.location.origin}/blog/article/${post.slug}`
      });
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(`${window.location.origin}/blog/article/${post.slug}`);
    }
  };

  console.log('BlogPostList render:', { 
    postsCount: posts.length, 
    loading, 
    selectedCategory,
    sortedPostsCount: sortedPosts.length 
  });

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          {onSearch && (
            <form onSubmit={handleSearch} className="flex-1">
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

          {/* Filtre par catégorie */}
          {onCategoryFilter && (
            <Select
              value={selectedCategory || 'all'}
              onValueChange={(value) => onCategoryFilter(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Tri */}
          <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as any)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="popular">Plus populaires</SelectItem>
              <SelectItem value="mostViewed">Plus vus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des articles */}
      {sortedPosts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedCategory ? 'Aucun article trouvé dans cette catégorie' : 'Aucun article trouvé'}
          </p>
          {selectedCategory && (
            <Button 
              variant="outline" 
              onClick={() => onCategoryFilter?.(null)}
              className="mt-4"
            >
              Voir tous les articles
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* Bouton "Charger plus" */}
      {hasMore && (
        <div className="text-center pt-8">
          <Button onClick={onLoadMore} disabled={loading}>
            {loading ? 'Chargement...' : 'Charger plus d\'articles'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogPostList;
