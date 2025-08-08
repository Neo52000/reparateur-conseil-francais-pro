
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, MessageCircle, User, Share2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/hooks/use-toast';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/types/blog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MarkdownRenderer from '@/components/blog/MarkdownRenderer';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { fetchPostBySlug, loading } = useBlog();
  const gamification = useGamification();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(false);

  // Déterminer si on vient du blog réparateurs
  const isFromRepairersBlog = location.pathname.includes('/blog/repairers') || 
                              (post && post.visibility === 'repairers');

  useEffect(() => {
    if (!slug) return;

    const loadPost = async () => {
      console.log('🔄 Loading blog post with slug:', slug);
      try {
        // Essayer d'abord avec le slug tel quel
        let postData = await fetchPostBySlug(slug);
        
        // Si pas trouvé, essayer avec le slug décodé
        if (!postData && slug.includes('%')) {
          const decodedSlug = decodeURIComponent(slug);
          console.log('🔄 Trying with decoded slug:', decodedSlug);
          postData = await fetchPostBySlug(decodedSlug);
        }
        
        // Si toujours pas trouvé, essayer avec le slug nettoyé
        if (!postData) {
          const cleanSlug = slug.replace(/[^a-zA-Z0-9\-]/g, '-').replace(/-+/g, '-');
          console.log('🔄 Trying with clean slug:', cleanSlug);
          postData = await fetchPostBySlug(cleanSlug);
        }
        
        if (postData) {
          setPost(postData);
          console.log('✅ Blog post loaded:', postData.title);
          
          // Gamification: track article read immediately
          if (!hasAwarded) {
            gamification.trackAction('article_read');
            setHasAwarded(true);
            toast({
              title: "📖 Article lu !",
              description: "+10 XP - Merci pour votre lecture",
              duration: 3000,
            });
          }
        } else {
          setNotFound(true);
          console.log('❌ Blog post not found for slug:', slug);
        }
      } catch (error) {
        console.error('❌ Error loading blog post:', error);
        setNotFound(true);
      }
    };

    loadPost();
  }, [slug, fetchPostBySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <p className="text-lg text-gray-600 mb-8">
            L'article que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <Link to="/blog">
              <Button variant="outline">
                Retour au blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  const pageTitle = post?.meta_title || post?.title || 'Article du blog - TopRéparateurs';
  const pageDescription = post?.meta_description || post?.excerpt || 'Conseils et actualités sur la réparation.';
  const canonicalUrl = `https://topreparateurs.fr/blog/article/${post?.slug || slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      {/* Header avec navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-4">
            {isFromRepairersBlog ? (
              <>
                <Link to="/repairer">
                  <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à l'espace réparateur
                  </Button>
                </Link>
                <Link to="/blog/repairers">
                  <Button variant="outline">
                    Retour au blog réparateurs
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à l'accueil
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button variant="outline">
                    Retour au blog
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Image de une */}
          {post.featured_image_url && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {post.category && (
                <Badge variant="outline">{post.category.name}</Badge>
              )}
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

            {/* Titre */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Extrait */}
            {post.excerpt && (
              <div className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </div>
            )}

            {/* Contenu */}
            <MarkdownRenderer content={post.content} />
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogArticlePage;
