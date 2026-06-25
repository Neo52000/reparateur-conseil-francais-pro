
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Eye, MessageCircle, Search, Filter, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogCategory } from '@/types/blog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BlogLayout from '@/components/blog/BlogLayout';

const POSTS_PER_PAGE = 12;

const BlogPage: React.FC = () => {
  const { fetchPosts, fetchCategories, loading } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadPosts = useCallback(async (reset: boolean = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      const filters: { status: string; limit: number; offset: number; category?: string } = {
        status: 'published',
        limit: POSTS_PER_PAGE,
        offset: currentOffset
      };
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      
      const data = await fetchPosts(filters);
      const newPosts = data || [];
      
      if (reset) {
        setPosts(newPosts);
        setOffset(POSTS_PER_PAGE);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setOffset(currentOffset + POSTS_PER_PAGE);
      }
      
      setHasMore(newPosts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading posts:', error);
      if (reset) setPosts([]);
    }
  }, [fetchPosts, categoryFilter, offset]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [fetchCategories]);

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    loadPosts(true);
  }, [categoryFilter]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadPosts(false);
    setIsLoadingMore(false);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  // Hero (premier article featured) + grid (les suivants) — uniquement si pas de filtre/recherche actif
  const showHero = filteredPosts.length > 0 && categoryFilter === 'all' && searchQuery === '';
  const heroPost = showHero ? filteredPosts[0] : null;
  const gridPosts = showHero ? filteredPosts.slice(1) : filteredPosts;

  return (
    <BlogLayout title="Blog" subtitle="Nos derniers articles et conseils">
      {/* Recherche */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher des articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Rechercher dans les articles"
          />
        </div>
      </div>

      {/* Filtres catégorie en pills (desktop+tablet) + select (mobile) */}
      <div className="mb-10">
        {/* Desktop pills */}
        <div className="hidden sm:flex flex-wrap gap-2" role="tablist" aria-label="Catégories">
          <button
            type="button"
            role="tab"
            aria-selected={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              categoryFilter === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border text-foreground',
            )}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={categoryFilter === category.id}
              onClick={() => setCategoryFilter(category.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                categoryFilter === category.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border text-foreground',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        {/* Mobile select */}
        <div className="sm:hidden">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
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
        </div>
      </div>

      {/* Articles */}
      {loading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {heroPost && (
            <Link
              to={`/blog/${heroPost.slug}`}
              className="group mb-10 block overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
              aria-label={`Lire l'article featured : ${heroPost.title}`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {heroPost.featured_image_url && (
                  <div className="aspect-video lg:aspect-auto lg:h-full overflow-hidden bg-muted">
                    <img
                      src={heroPost.featured_image_url}
                      alt={heroPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="eager"
                    />
                  </div>
                )}
                <div className="p-6 lg:p-10 flex flex-col justify-center">
                  <div className="mb-4 flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0">
                      À la une
                    </Badge>
                    {heroPost.category && (
                      <Badge variant="outline">{heroPost.category.name}</Badge>
                    )}
                  </div>
                  <h2 className="font-heading text-2xl lg:text-3xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                    {heroPost.title}
                  </h2>
                  {heroPost.excerpt && (
                    <p className="text-muted-foreground mb-6 line-clamp-3">{heroPost.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(heroPost.published_at || heroPost.created_at)}</span>
                    </div>
                    <span aria-hidden className="inline-flex items-center text-primary font-medium ml-auto">
                      Lire l'article <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {post.featured_image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  {post.category && (
                    <Badge variant="outline" className="mb-3">
                      {post.category.name}
                    </Badge>
                  )}
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      {post.view_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.view_count}</span>
                        </div>
                      )}
                      {post.comment_count > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comment_count}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link to={`/blog/${post.slug}`}>
                    <Button size="sm" className="w-full">
                      Lire l'article
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Aucun article trouvé.</p>
            </div>
          )}

          {/* Bouton Charger plus */}
          {hasMore && filteredPosts.length > 0 && searchQuery === '' && (
            <div className="flex justify-center mt-12">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoadingMore}
                variant="outline"
                size="lg"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Charger plus d'articles"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </BlogLayout>
  );
};

export default BlogPage;
