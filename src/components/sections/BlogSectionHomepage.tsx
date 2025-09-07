import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Eye, MessageCircle, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/types/blog';
import { NavigationService } from '@/services/navigationService';
const BlogSectionHomepage: React.FC = () => {
  const {
    fetchPosts,
    loading
  } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (hasLoaded) return;
    const loadRecentPosts = async () => {
      console.log('🔄 Loading recent blog posts for homepage...');
      try {
        const recentPosts = await fetchPosts({
          visibility: 'public',
          status: 'published',
          limit: 6
        });
        console.log('✅ Blog posts loaded:', recentPosts?.length || 0);
        setPosts(recentPosts || []);
        setHasLoaded(true);
      } catch (error) {
        console.error('❌ Error loading blog posts:', error);
        setHasLoaded(true);
      }
    };
    loadRecentPosts();
  }, [fetchPosts, hasLoaded]);
  if (loading && !hasLoaded) {
    return <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos derniers conseils et actualités
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>;
  }
  if (!posts.length && hasLoaded) {
    console.log('⚠️ No blog posts to display on homepage');
    return null;
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour créer des URLs d'articles sécurisées
  const getArticleUrl = (post: BlogPost) => {
    console.log('🔗 Creating article URL for post:', {
      id: post.id,
      slug: post.slug,
      title: post.title
    });
    if (!post.slug || post.slug.trim() === '') {
      console.warn('⚠️ Empty slug detected for post:', post.title);
      // Générer un slug à partir du titre comme fallback
      const fallbackSlug = post.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
      .replace(/^-|-$/g, ''); // Supprimer les tirets en début et fin

      console.log('🔧 Generated fallback slug:', fallbackSlug);
      return fallbackSlug ? `/blog/article/${fallbackSlug}` : '#';
    }

    // Utiliser le service de navigation pour nettoyer le slug
    const url = NavigationService.getBlogArticleUrl(post.slug);
    console.log('🔗 Final article URL:', url);
    return url;
  };
  const handleArticleClick = (post: BlogPost) => {
    console.log('🔗 Article clicked:', {
      id: post.id,
      title: post.title,
      slug: post.slug,
      url: getArticleUrl(post)
    });
  };
  return <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Le Blog</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">Guides pratiques, conseils d'experts et actualités </p>
          
          {/* Rubriques spécialisées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Réparer ou jeter ?</h3>
                <p className="text-sm text-gray-600">Guides de décision</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-100">
              <Award className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Trouver un réparateur</h3>
                <p className="text-sm text-gray-600">Conseils de sélection</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Bonus ADEME</h3>
                <p className="text-sm text-gray-600">Mode d'emploi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map(post => <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
              {post.featured_image_url && <div className="h-48 overflow-hidden">
                  <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>}
              <CardContent className="p-6">
                {post.category && <span className="inline-block px-3 py-1 text-xs font-semibold text-info-badge-foreground bg-info-badge-light rounded-full mb-3">
                    {post.category.name}
                  </span>}
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                  <Link to={getArticleUrl(post)} onClick={() => handleArticleClick(post)}>
                    {post.title}
                  </Link>
                </h3>
                
                {post.excerpt && <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    {post.view_count > 0 && <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.view_count}</span>
                      </div>}
                    {post.comment_count > 0 && <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comment_count}</span>
                      </div>}
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        <div className="text-center">
          
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
              Voir tous les articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};
export default BlogSectionHomepage;