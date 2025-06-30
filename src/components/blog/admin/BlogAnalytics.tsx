
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, MessageSquare, Share2, TrendingUp, Users, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  totalShares: number;
  postsThisMonth: number;
  avgViewsPerPost: number;
  topPosts: Array<{
    title: string;
    views: number;
    comments: number;
    shares: number;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
    posts: number;
  }>;
  categoriesStats: Array<{
    name: string;
    posts: number;
    views: number;
    color: string;
  }>;
  visibilityStats: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const BlogAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Récupérer les statistiques générales
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          view_count,
          comment_count,
          share_count,
          created_at,
          visibility,
          category:blog_categories(name)
        `);

      if (postsError) throw postsError;

      const now = new Date();
      const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
      const recentPosts = posts?.filter(post => new Date(post.created_at) >= daysAgo) || [];

      // Calculer les métriques
      const totalPosts = posts?.length || 0;
      const totalViews = posts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
      const totalComments = posts?.reduce((sum, post) => sum + (post.comment_count || 0), 0) || 0;
      const totalShares = posts?.reduce((sum, post) => sum + (post.share_count || 0), 0) || 0;
      const postsThisMonth = recentPosts.length;
      const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

      // Top articles
      const topPosts = posts
        ?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 5)
        .map(post => ({
          title: post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title,
          views: post.view_count || 0,
          comments: post.comment_count || 0,
          shares: post.share_count || 0
        })) || [];

      // Vues par jour (derniers 7 jours)
      const viewsByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayPosts = posts?.filter(post => 
          new Date(post.created_at).toDateString() === date.toDateString()
        ) || [];
        
        viewsByDay.push({
          date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          views: dayPosts.reduce((sum, post) => sum + (post.view_count || 0), 0),
          posts: dayPosts.length
        });
      }

      // Statistiques par catégorie
      const categoryMap = new Map();
      posts?.forEach(post => {
        const categoryName = post.category?.name || 'Non catégorisé';
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { posts: 0, views: 0 });
        }
        const current = categoryMap.get(categoryName);
        current.posts += 1;
        current.views += post.view_count || 0;
      });

      const categoriesStats = Array.from(categoryMap.entries()).map(([name, stats], index) => ({
        name,
        posts: stats.posts,
        views: stats.views,
        color: COLORS[index % COLORS.length]
      }));

      // Statistiques de visibilité
      const visibilityMap = new Map();
      posts?.forEach(post => {
        const visibility = post.visibility || 'public';
        visibilityMap.set(visibility, (visibilityMap.get(visibility) || 0) + 1);
      });

      const visibilityStats = Array.from(visibilityMap.entries()).map(([type, count]) => ({
        type: type === 'public' ? 'Public' : type === 'repairers' ? 'Réparateurs' : 'Mixte',
        count,
        percentage: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0
      }));

      setAnalytics({
        totalPosts,
        totalViews,
        totalComments,
        totalShares,
        postsThisMonth,
        avgViewsPerPost,
        topPosts,
        viewsByDay,
        categoriesStats,
        visibilityStats
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Chargement des analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics du Blog</h2>
          <p className="text-muted-foreground">Tableau de bord des performances</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="365">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium ml-2">Total Articles</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold">{analytics.totalPosts}</p>
              <Badge variant="secondary">+{analytics.postsThisMonth} ce mois</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium ml-2">Total Vues</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              <Badge variant="secondary">{analytics.avgViewsPerPost}/article</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-medium ml-2">Commentaires</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold">{analytics.totalComments}</p>
              <Badge variant="secondary">
                {analytics.totalPosts > 0 ? Math.round(analytics.totalComments / analytics.totalPosts) : 0}/article
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Share2 className="h-4 w-4 text-orange-600" />
              <p className="text-sm font-medium ml-2">Partages</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold">{analytics.totalShares}</p>
              <Badge variant="secondary">
                {analytics.totalPosts > 0 ? Math.round(analytics.totalShares / analytics.totalPosts) : 0}/article
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des vues par jour */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des vues (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par visibilité */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par visibilité</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.visibilityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  label={({ type, percentage }) => `${type} (${percentage}%)`}
                >
                  {analytics.visibilityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top articles */}
        <Card>
          <CardHeader>
            <CardTitle>Articles les plus populaires</CardTitle>
            <CardDescription>Classés par nombre de vues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{post.title}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {post.views}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {post.comments}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Share2 className="h-3 w-3 mr-1" />
                        {post.shares}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.categoriesStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="#8884d8" name="Articles" />
                <Bar dataKey="views" fill="#82ca9d" name="Vues" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogAnalytics;
