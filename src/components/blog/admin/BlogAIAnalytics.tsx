import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Bot, Eye, TrendingUp, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIAnalyticsData {
  totalAIPosts: number;
  totalManualPosts: number;
  aiPercentage: number;
  avgAIViews: number;
  avgManualViews: number;
  aiEngagementRate: number;
  manualEngagementRate: number;
  aiModelDistribution: Array<{
    model: string;
    count: number;
    avgViews: number;
  }>;
  aiPerformanceOverTime: Array<{
    date: string;
    aiPosts: number;
    manualPosts: number;
    aiViews: number;
    manualViews: number;
  }>;
  seoMetrics: {
    withMeta: number;
    withKeywords: number;
    avgKeywordsCount: number;
  };
  moderationStats: {
    pending: number;
    approved: number;
    needsReview: number;
  };
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export const BlogAIAnalytics = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AIAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadAIAnalytics();
  }, [timeRange]);

  const loadAIAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .gte('created_at', daysAgo.toISOString());

      if (error) throw error;

      const aiPosts = posts?.filter(p => p.ai_generated) || [];
      const manualPosts = posts?.filter(p => !p.ai_generated) || [];

      const totalAIPosts = aiPosts.length;
      const totalManualPosts = manualPosts.length;
      const aiPercentage = posts && posts.length > 0 ? Math.round((totalAIPosts / posts.length) * 100) : 0;

      const avgAIViews = totalAIPosts > 0 
        ? Math.round(aiPosts.reduce((sum, p) => sum + (p.view_count || 0), 0) / totalAIPosts)
        : 0;
      
      const avgManualViews = totalManualPosts > 0
        ? Math.round(manualPosts.reduce((sum, p) => sum + (p.view_count || 0), 0) / totalManualPosts)
        : 0;

      const calcEngagementRate = (posts: any[]) => {
        if (posts.length === 0) return 0;
        const totalEngagement = posts.reduce((sum, p) => 
          sum + (p.comment_count || 0) + (p.share_count || 0), 0);
        const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);
        return totalViews > 0 ? Math.round((totalEngagement / totalViews) * 100) : 0;
      };

      const aiEngagementRate = calcEngagementRate(aiPosts);
      const manualEngagementRate = calcEngagementRate(manualPosts);

      // Distribution par modèle AI
      const modelMap = new Map();
      aiPosts.forEach(post => {
        const model = post.ai_model || 'Unknown';
        if (!modelMap.has(model)) {
          modelMap.set(model, { count: 0, totalViews: 0 });
        }
        const current = modelMap.get(model);
        current.count += 1;
        current.totalViews += post.view_count || 0;
      });

      const aiModelDistribution = Array.from(modelMap.entries()).map(([model, stats]) => ({
        model,
        count: stats.count,
        avgViews: stats.count > 0 ? Math.round(stats.totalViews / stats.count) : 0
      }));

      // Performance au fil du temps (derniers 7 jours)
      const aiPerformanceOverTime = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayAIPosts = aiPosts.filter(p => 
          new Date(p.created_at).toDateString() === date.toDateString()
        );
        const dayManualPosts = manualPosts.filter(p => 
          new Date(p.created_at).toDateString() === date.toDateString()
        );

        aiPerformanceOverTime.push({
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          aiPosts: dayAIPosts.length,
          manualPosts: dayManualPosts.length,
          aiViews: dayAIPosts.reduce((sum, p) => sum + (p.view_count || 0), 0),
          manualViews: dayManualPosts.reduce((sum, p) => sum + (p.view_count || 0), 0)
        });
      }

      // Métriques SEO
      const withMeta = aiPosts.filter(p => p.meta_title && p.meta_description).length;
      const withKeywords = aiPosts.filter(p => p.keywords && p.keywords.length > 0).length;
      const avgKeywordsCount = aiPosts.length > 0
        ? Math.round(aiPosts.reduce((sum, p) => sum + (p.keywords?.length || 0), 0) / aiPosts.length)
        : 0;

      // Statistiques de modération
      const pending = posts?.filter(p => p.status === 'pending').length || 0;
      const approved = posts?.filter(p => p.status === 'published').length || 0;
      const needsReview = posts?.filter(p => p.status === 'draft' && p.ai_generated).length || 0;

      setAnalytics({
        totalAIPosts,
        totalManualPosts,
        aiPercentage,
        avgAIViews,
        avgManualViews,
        aiEngagementRate,
        manualEngagementRate,
        aiModelDistribution,
        aiPerformanceOverTime,
        seoMetrics: {
          withMeta,
          withKeywords,
          avgKeywordsCount
        },
        moderationStats: {
          pending,
          approved,
          needsReview
        }
      });

    } catch (error) {
      console.error('Error loading AI analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics IA",
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des analytics IA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Analytics Articles IA
          </h2>
          <p className="text-muted-foreground">Performance des articles générés par intelligence artificielle</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales comparatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Articles IA</p>
                <p className="text-2xl font-bold">{analytics.totalAIPosts}</p>
                <Badge variant="secondary" className="mt-1">{analytics.aiPercentage}% du total</Badge>
              </div>
              <Bot className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vues moyennes IA</p>
                <p className="text-2xl font-bold">{analytics.avgAIViews}</p>
                <div className="mt-1 flex items-center gap-1">
                  {analytics.avgAIViews > analytics.avgManualViews ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        +{Math.round(((analytics.avgAIViews - analytics.avgManualViews) / analytics.avgManualViews) * 100)}% vs manuel
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      vs {analytics.avgManualViews} manuel
                    </span>
                  )}
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement IA</p>
                <p className="text-2xl font-bold">{analytics.aiEngagementRate}%</p>
                <Badge variant={analytics.aiEngagementRate >= 5 ? "default" : "secondary"} className="mt-1">
                  {analytics.aiEngagementRate >= 5 ? "Excellent" : "Bon"}
                </Badge>
              </div>
              <Award className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{analytics.moderationStats.needsReview}</p>
                <Badge variant={analytics.moderationStats.needsReview > 5 ? "destructive" : "secondary"} className="mt-1">
                  {analytics.moderationStats.needsReview > 5 ? "Action requise" : "OK"}
                </Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique comparatif IA vs Manuel */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution IA vs Manuel (7 jours)</CardTitle>
            <CardDescription>Comparaison du nombre de vues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.aiPerformanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="aiViews" stroke="#10B981" strokeWidth={2} name="Vues IA" />
                <Line type="monotone" dataKey="manualViews" stroke="#6B7280" strokeWidth={2} name="Vues Manuel" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution par modèle AI */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par modèle IA</CardTitle>
            <CardDescription>Répartition et efficacité des modèles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.aiModelDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="Articles" />
                <Bar dataKey="avgViews" fill="#3B82F6" name="Vues moy." />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métriques SEO et Modération */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Métriques SEO</CardTitle>
            <CardDescription>Optimisation pour les moteurs de recherche</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Meta-données complètes</p>
                  <p className="text-sm text-muted-foreground">Titre et description SEO</p>
                </div>
                <Badge variant={analytics.seoMetrics.withMeta > analytics.totalAIPosts * 0.8 ? "default" : "secondary"}>
                  {analytics.seoMetrics.withMeta}/{analytics.totalAIPosts}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Articles avec mots-clés</p>
                  <p className="text-sm text-muted-foreground">Optimisation des keywords</p>
                </div>
                <Badge variant={analytics.seoMetrics.withKeywords > analytics.totalAIPosts * 0.7 ? "default" : "secondary"}>
                  {analytics.seoMetrics.withKeywords}/{analytics.totalAIPosts}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Mots-clés moyens/article</p>
                  <p className="text-sm text-muted-foreground">Densité de keywords</p>
                </div>
                <Badge variant={analytics.seoMetrics.avgKeywordsCount >= 5 ? "default" : "secondary"}>
                  {analytics.seoMetrics.avgKeywordsCount} mots-clés
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>État de modération</CardTitle>
            <CardDescription>Workflow de validation des articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Publiés</p>
                    <p className="text-sm text-muted-foreground">Articles en ligne</p>
                  </div>
                </div>
                <Badge variant="default">{analytics.moderationStats.approved}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">En attente de revue</p>
                    <p className="text-sm text-muted-foreground">Brouillons IA à valider</p>
                  </div>
                </div>
                <Badge variant={analytics.moderationStats.needsReview > 5 ? "destructive" : "secondary"}>
                  {analytics.moderationStats.needsReview}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">En cours de modération</p>
                    <p className="text-sm text-muted-foreground">Analyse en cours</p>
                  </div>
                </div>
                <Badge variant="secondary">{analytics.moderationStats.pending}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
