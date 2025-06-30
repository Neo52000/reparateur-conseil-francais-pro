import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost, BlogCategory } from '@/types/blog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BlogPostEditor from './BlogPostEditor';

interface BlogPostsManagerProps {
  forceShowEditor?: boolean;
  onEditorStateChange?: (show: boolean) => void;
}

const BlogPostsManager: React.FC<BlogPostsManagerProps> = ({ 
  forceShowEditor = false, 
  onEditorStateChange 
}) => {
  const { fetchPosts, fetchCategories, deletePost, loading } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (forceShowEditor) {
      setShowEditor(true);
      setSelectedPost(null);
    }
  }, [forceShowEditor]);

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
                    <div>
                      <div className="font-medium">{post.title}</div>
                      {post.ai_generated && <Badge variant="secondary" className="text-xs mt-1">IA</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.category?.name || 'Non catégorisé'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(post.status)}
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
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleShowEditor(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeletePost(post.id)}
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
    </Card>
  );
};

export default BlogPostsManager;
