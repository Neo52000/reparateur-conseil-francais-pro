import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, MessageCircle, User } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MarkdownRenderer from './MarkdownRenderer';

interface BlogPreviewModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({ post, isOpen, onClose }) => {
  if (!post) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Brouillon' },
      pending: { variant: 'outline' as const, label: 'En attente' },
      scheduled: { variant: 'default' as const, label: 'Programmé' },
      published: { variant: 'default' as const, label: 'Publié' },
      archived: { variant: 'secondary' as const, label: 'Archivé' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getVisibilityBadge = (visibility: string) => {
    const visibilityConfig = {
      public: { variant: 'secondary' as const, label: 'Public' },
      repairers: { variant: 'default' as const, label: 'Réparateurs' },
      both: { variant: 'outline' as const, label: 'Mixte' }
    };
    
    const config = visibilityConfig[visibility as keyof typeof visibilityConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu de l'article</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-4 pb-4 border-b">
            <div className="flex gap-2">
              {getStatusBadge(post.status)}
              {getVisibilityBadge(post.visibility)}
            </div>
            {post.category && (
              <Badge variant="outline">{post.category.name}</Badge>
            )}
            <div className="flex items-center text-sm text-muted-foreground gap-4">
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
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.view_count} vues
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.comment_count} commentaires
              </div>
            </div>
          </div>

          {/* Image de une */}
          {post.featured_image_url && (
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Titre */}
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>

          {/* Extrait */}
          {post.excerpt && (
            <div className="text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </div>
          )}

          {/* Contenu */}
          <div className="border-t pt-6">
            <MarkdownRenderer content={post.content} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPreviewModal;