
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Eye, MessageCircle, Share2, User } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogPostCardProps {
  post: BlogPost;
  showVisibility?: boolean;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, showVisibility = false }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVisibilityBadge = () => {
    const badges = {
      public: { label: 'Public', variant: 'default' as const },
      repairers: { label: 'Réparateurs', variant: 'secondary' as const },
      both: { label: 'Mixte', variant: 'outline' as const }
    };
    
    return badges[post.visibility] || badges.public;
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      {post.featured_image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          {post.blog_categories && (
            <Badge variant="outline" className="text-xs">
              {post.blog_categories.name}
            </Badge>
          )}
          
          {showVisibility && (
            <Badge variant={getVisibilityBadge().variant} className="text-xs">
              {getVisibilityBadge().label}
            </Badge>
          )}
        </div>
        
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        {post.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3 mt-2">
            {post.excerpt}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{post.view_count}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comment_count}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex items-center space-x-2 w-full">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          
          <span className="text-xs text-gray-600">
            {post.profiles ? 
              `${post.profiles.first_name} ${post.profiles.last_name}`.trim() || post.profiles.email :
              'Auteur anonyme'
            }
          </span>
          
          {post.ai_generated && (
            <Badge variant="secondary" className="text-xs ml-auto">
              IA
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
