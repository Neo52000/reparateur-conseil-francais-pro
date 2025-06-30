
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, MessageCircle, Share2, User } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BlogPostCardProps {
  post: BlogPost;
  showExcerpt?: boolean;
  onShare?: (post: BlogPost) => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ 
  post, 
  showExcerpt = true,
  onShare 
}) => {
  const getVisibilityBadge = () => {
    switch (post.visibility) {
      case 'public':
        return <Badge variant="secondary">Public</Badge>;
      case 'repairers':
        return <Badge variant="default">Réparateurs</Badge>;
      case 'both':
        return <Badge variant="outline">Mixte</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      {post.featured_image_url && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-2">
            {post.category && (
              <Badge variant="outline">{post.category.name}</Badge>
            )}
            {getVisibilityBadge()}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold line-clamp-2 hover:text-blue-600 transition-colors">
          <Link to={`/blog/article/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        
        {showExcerpt && post.excerpt && (
          <p className="text-gray-600 line-clamp-3 mt-2">
            {post.excerpt}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 flex-grow">
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(post.published_at || post.created_at)}
          </div>
          
          {post.author && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {post.author.first_name} {post.author.last_name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {post.view_count}
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comment_count}
          </div>
          <div className="flex items-center">
            <Share2 className="h-4 w-4 mr-1" />
            {post.share_count}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link to={`/blog/article/${post.slug}`}>
            <Button size="sm" variant="outline">
              Lire la suite
            </Button>
          </Link>
          {onShare && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onShare(post)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
