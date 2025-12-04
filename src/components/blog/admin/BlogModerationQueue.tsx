import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Eye, Bot } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const BlogModerationQueue = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<string | null>(null);

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const loadPendingPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(name, icon),
          author:profiles(first_name, last_name, email)
        `)
        .in('status', ['pending', 'draft'])
        .eq('ai_generated', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as BlogPost[]);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la file de modération",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // TODO: Réactiver quand blog-ai-moderation sera actif
  const runModeration = async (postId: string) => {
    toast({
      title: "Fonction désactivée",
      description: "L'analyse IA automatique sera disponible prochainement. Vous pouvez approuver ou rejeter manuellement.",
      variant: "default"
    });
  };

  const approvePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Article approuvé",
        description: "L'article a été publié avec succès"
      });

      await loadPendingPosts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'approuver l'article",
        variant: "destructive"
      });
    }
  };

  const rejectPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: 'archived' })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Article rejeté",
        description: "L'article a été archivé"
      });

      await loadPendingPosts();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de rejeter l'article",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement de la file de modération...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>File de modération</CardTitle>
          <CardDescription>Articles en attente de validation</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Aucun article en attente de modération. Tous les articles générés par IA ont été validés.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          File de modération
        </h2>
        <p className="text-muted-foreground">
          {posts.length} article{posts.length > 1 ? 's' : ''} en attente de validation
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <Badge variant={post.status === 'pending' ? 'default' : 'secondary'}>
                      {post.status === 'pending' ? 'En attente' : 'Brouillon'}
                    </Badge>
                    {post.ai_model && (
                      <Badge variant="outline">{post.ai_model}</Badge>
                    )}
                    {post.category && (
                      <Badge variant="secondary">
                        {post.category.icon} {post.category.name}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Créé le {new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>{post.content?.length || 0} caractères</span>
                    {post.keywords && post.keywords.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{post.keywords.length} mots-clés</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Prévisualiser
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => runModeration(post.id)}
                    disabled={true}
                    className="opacity-50"
                    title="Fonction temporairement désactivée"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Analyser (Bientôt)
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approvePost(post.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectPost(post.id)}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
