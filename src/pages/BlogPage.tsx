
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Eye, MessageCircle, Search, Filter } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogCategory } from '@/types/blog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BlogLayout from '@/components/blog/BlogLayout';

const BlogPage: React.FC = () => {
  const { fetchPosts, fetchCategories, loading } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [categoryFilter]);

  const loadPosts = async () => {
    const filters: any = {
      visibility: 'public',
      status: 'published'
    };
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    
    const data = await fetchPosts(filters);
    setPosts(data);
  };

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <BlogLayout title="Blog" subtitle="Nos derniers articles et conseils">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
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
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  <Link to={`/blog/article/${post.slug}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </Link>
                </h3>
                
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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

                <Link to={`/blog/article/${post.slug}`}>
                  <Button size="sm" className="w-full">
                    Lire l'article
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun article trouvé.</p>
        </div>
      )}
    </BlogLayout>
  );
};

export default BlogPage;
