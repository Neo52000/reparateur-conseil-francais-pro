
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2, Plus, Search, Filter, ExternalLink, ImagePlus } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { useBlogPosts } from '@/hooks/blog/useBlogPosts';
import { BlogPost, BlogCategory } from '@/types/blog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BlogPostEditor from './BlogPostEditor';
import BlogPreviewModal from '../BlogPreviewModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BlogPostsManagerProps {
  forceShowEditor?: boolean;
  onEditorStateChange?: (show: boolean) => void;
  editingPost?: BlogPost | null;
}

const BlogPostsManager: React.FC<BlogPostsManagerProps> = ({ 
  forceShowEditor = false, 
  onEditorStateChange,
  editingPost = null
}) => {
  const { fetchPosts, fetchCategories, deletePost, loading } = useBlog();
  const { savePost } = useBlogPosts();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [regeneratingImages, setRegeneratingImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (forceShowEditor) {
      setShowEditor(true);
      setSelectedPost(editingPost);
    }
  }, [forceShowEditor, editingPost]);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [statusFilter, categoryFilter]);

  const loadPosts = async () => {
    const filters: any = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    
    const data = await fetchPosts(filters);
    setPosts(data);
  };

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      const success = await deletePost(id);
      if (success) {
        loadPosts();
      }
    }
  };

  const handleShowEditor = (post: BlogPost | null = null) => {
    setSelectedPost(post);
    setShowEditor(true);
    onEditorStateChange?.(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedPost(null);
    onEditorStateChange?.(false);
    loadPosts();
  };

  const handlePreviewPost = (post: BlogPost) => {
    if (post.status === 'published') {
      // Si l'article est publié, ouvrir la page publique
      window.open(`/blog/article/${post.slug}`, '_blank');
    } else {
      // Pour les autres statuts, utiliser le modal de prévisualisation
      setPreviewPost(post);
      setShowPreview(true);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: 'draft' | 'pending' | 'scheduled' | 'published' | 'archived') => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const result = await savePost({
      ...post,
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : post.published_at
    }, true);

    if (result) {
      toast({
        title: "Statut mis à jour",
        description: `L'article est maintenant "${getStatusLabel(newStatus)}"`
      });
      loadPosts();
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Brouillon',
      pending: 'En attente',
      scheduled: 'Programmé',
      published: 'Publié',
      archived: 'Archivé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleRegenerateImage = async (post: BlogPost) => {
    setRegeneratingImages(prev => new Set(prev).add(post.id));
    
    try {
      const { data, error } = await supabase.functions.invoke('blog-image-generator', {
        body: {
          prompt: `Professional blog header for article: "${post.title}". Modern smartphone repair, technology, professional service. Clean design, realistic style.`,
          style: 'realistic',
          size: '1792x1024'
        }
      });

      if (error) throw error;

      const imageUrl = data?.image_url;
      if (imageUrl) {
        await savePost({ ...post, featured_image_url: imageUrl }, true);
        toast({
          title: "Image régénérée",
          description: "L'image de l'article a été mise à jour avec succès"
        });
        loadPosts();
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de régénérer l'image",
        variant: "destructive"
      });
    } finally {
      setRegeneratingImages(prev => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    }
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showEditor) {
    return (
      <BlogPostEditor
        post={selectedPost}
        onSave={handleCloseEditor}
        onCancel={handleCloseEditor}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Articles du Blog</CardTitle>
            <CardDescription>Gérez tous vos articles de blog</CardDescription>
          </div>
          <Button onClick={() => handleShowEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher des articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="scheduled">Programmés</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="archived">Archivés</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Visibilité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                  </TableCell>
                  <TableCell>
                    {post.category?.name || 'Non catégorisé'}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={post.status} 
                      onValueChange={(value: any) => handleStatusChange(post.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="scheduled">Programmé</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                        <SelectItem value="archived">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {getVisibilityBadge(post.visibility)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(post.published_at || post.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{post.view_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerateImage(post)}
                        disabled={regeneratingImages.has(post.id)}
                        title="Régénérer l'image"
                      >
                        <ImagePlus className={`h-4 w-4 ${regeneratingImages.has(post.id) ? 'animate-pulse' : ''}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePreviewPost(post)}
                        title="Prévisualiser l'article"
                      >
                        {post.status === 'published' ? (
                          <ExternalLink className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleShowEditor(post)}
                        title="Modifier l'article"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeletePost(post.id)}
                        title="Supprimer l'article"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <BlogPreviewModal
        post={previewPost}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewPost(null);
        }}
      />
    </Card>
  );
};

export default BlogPostsManager;
