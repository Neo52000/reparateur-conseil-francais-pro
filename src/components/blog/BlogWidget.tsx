
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { useAuth } from '@/hooks/useAuth';
import { BlogPost } from '@/types/blog';

interface BlogWidgetProps {
  limit?: number;
  showCategory?: boolean;
}

const BlogWidget: React.FC<BlogWidgetProps> = ({ limit = 3, showCategory = true }) => {
  const { fetchPosts } = useBlog();
  const { canAccessRepairer } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        const filters = {
          visibility: canAccessRepairer ? 'both' : 'public',
          limit
        };
        
        const data = await fetchPosts(filters);
        setPosts(data);
      } catch (error) {
        console.error('Error loading recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentPosts();
  }, [fetchPosts, limit, canAccessRepairer]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5 text-blue-600" />
            <span>Derniers articles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          <span>Derniers articles</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start space-x-3">
                {post.featured_image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <Link to={`/blog/${post.slug}`}>
                    <h4 className="text-sm font-semibold hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </Link>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    
                    {showCategory && post.blog_categories && (
                      <Badge variant="outline" className="text-xs">
                        {post.blog_categories.name}
                      </Badge>
                    )}
                    
                    {post.ai_generated && (
                      <Badge variant="secondary" className="text-xs">
                        IA
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Link to="/blog">
            <Button variant="outline" className="w-full">
              Voir tous les articles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogWidget;
