import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, TrendingUp, AlertTriangle, CheckCircle, Globe, Link2,
  FileText, BarChart3, RefreshCw, Eye, ArrowUpRight, Zap,
  BookOpen, Target, Gauge, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import { seoMachineAnalyzer, SeoAnalysisResult, TopicCluster } from '@/services/seo/seoMachineAnalyzer';
import { seoInternalLinking } from '@/services/seo/seoInternalLinking';

interface AdminSeoMachinePanelProps {
  className?: string;
}

/**
 * Panneau admin SEO Machine - Audit, Analyse, Topic Clusters, Maillage interne
 * Inspiré par https://github.com/TheCraigHewitt/seomachine
 */
export function AdminSeoMachinePanel({ className }: AdminSeoMachinePanelProps) {
  const [activeTab, setActiveTab] = useState('audit');
  const [loading, setLoading] = useState(false);

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          SEO Machine
        </h2>
        <p className="text-muted-foreground">
          Analyse, audit et optimisation SEO selon la méthodologie SEO Machine
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit" className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            Audit SEO
          </TabsTrigger>
          <TabsTrigger value="clusters" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            Topic Clusters
          </TabsTrigger>
          <TabsTrigger value="linking" className="flex items-center gap-1">
            <Link2 className="w-4 h-4" />
            Maillage
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            Contenu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <SeoAuditTab />
        </TabsContent>

        <TabsContent value="clusters">
          <TopicClusterTab />
        </TabsContent>

        <TabsContent value="linking">
          <InternalLinkingTab />
        </TabsContent>

        <TabsContent value="content">
          <ContentAnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Tab Audit SEO - Analyse d'une page
 */
function SeoAuditTab() {
  const [title, setTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [h1, setH1] = useState('');
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<SeoAnalysisResult | null>(null);

  const runAudit = () => {
    if (!title || !keyword) {
      toast.error('Remplissez au moins le titre et le mot-clé cible');
      return;
    }

    const analysis = seoMachineAnalyzer.analyzeContent({
      title,
      metaDescription: metaDesc,
      h1: h1 || title,
      content,
      targetKeyword: keyword,
      url: url || '/',
      hasStructuredData: true,
      hasCanonical: true
    });

    setResult(analysis);
    toast.success(`Audit terminé - Score: ${analysis.score}/100 (${analysis.grade})`);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Analyser une page
          </CardTitle>
          <CardDescription>
            Entrez les détails d'une page pour obtenir un audit SEO complet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Mot-clé cible *</label>
              <Input value={keyword} onChange={e => setKeyword(e.target.value)} 
                placeholder="réparation smartphone paris" />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input value={url} onChange={e => setUrl(e.target.value)} 
                placeholder="/reparateur-smartphone-paris" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Titre (title tag) *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} 
              placeholder="Réparation Smartphone Paris - 50+ Réparateurs Certifiés" />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/60 caractères</p>
          </div>
          <div>
            <label className="text-sm font-medium">Meta Description</label>
            <Textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} 
              placeholder="Trouvez les meilleurs réparateurs..." rows={2} />
            <p className="text-xs text-muted-foreground mt-1">{metaDesc.length}/160 caractères</p>
          </div>
          <div>
            <label className="text-sm font-medium">H1</label>
            <Input value={h1} onChange={e => setH1(e.target.value)} 
              placeholder="Réparation Smartphone à Paris" />
          </div>
          <div>
            <label className="text-sm font-medium">Contenu</label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} 
              placeholder="Collez le contenu de la page..." rows={5} />
          </div>
          <Button onClick={runAudit} className="w-full">
            <Gauge className="w-4 h-4 mr-2" />
            Lancer l'audit SEO
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Score global */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </div>
                <p className="text-3xl font-bold mt-2">{result.score}/100</p>
                <p className="text-sm text-muted-foreground">Score SEO global</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{result.contentMetrics.wordCount}</p>
                <p className="text-sm text-muted-foreground">Mots</p>
                <p className="text-xs mt-1">
                  ~{result.contentMetrics.estimatedReadTime} min de lecture
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{result.readabilityScore.fleschKincaid}</p>
                <p className="text-sm text-muted-foreground">Lisibilité</p>
                <Badge variant="outline">{result.readabilityScore.grade}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Détail du score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(result.breakdown).map(([key, value]) => {
                const maxScores: Record<string, number> = {
                  title: 15, metaDescription: 15, headings: 10, content: 15,
                  keywords: 10, internalLinks: 10, readability: 10,
                  structuredData: 10, technicalSeo: 5
                };
                const labels: Record<string, string> = {
                  title: 'Titre', metaDescription: 'Meta Description', headings: 'Titres (H1-H6)',
                  content: 'Contenu', keywords: 'Mots-clés', internalLinks: 'Maillage interne',
                  readability: 'Lisibilité', structuredData: 'Données structurées',
                  technicalSeo: 'SEO technique'
                };
                const max = maxScores[key] || 10;
                const pct = (value / max) * 100;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm w-40 shrink-0">{labels[key] || key}</span>
                    <Progress value={pct} className="flex-1" />
                    <span className="text-sm font-medium w-12 text-right">{value}/{max}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Analyse mots-clés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {result.keywordAnalysis.inTitle ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <span className="text-sm">Dans le titre</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.keywordAnalysis.inH1 ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <span className="text-sm">Dans le H1</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.keywordAnalysis.inMetaDescription ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <span className="text-sm">Dans la meta description</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.keywordAnalysis.inFirstParagraph ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <span className="text-sm">Dans le 1er paragraphe</span>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p>Densité: <strong>{result.keywordAnalysis.density.toFixed(1)}%</strong> (idéal: 1-3%)</p>
                <p>Occurrences: <strong>{result.keywordAnalysis.occurrences}</strong></p>
              </div>
              {result.keywordAnalysis.relatedKeywords.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Mots-clés LSI détectés :</p>
                  <div className="flex flex-wrap gap-1">
                    {result.keywordAnalysis.relatedKeywords.map(rk => (
                      <Badge key={rk.keyword} variant="secondary" className="text-xs">
                        {rk.keyword} ({rk.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Suggestions d'optimisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    {s.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                    {s.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />}
                    {s.type === 'info' && <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                    {s.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-sm">{s.message}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{s.category}</Badge>
                        <Badge variant={s.impact === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          Impact {s.impact === 'high' ? 'élevé' : s.impact === 'medium' ? 'moyen' : 'faible'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * Tab Topic Clusters
 */
function TopicClusterTab() {
  const [clusters, setClusters] = useState<TopicCluster[]>([]);

  useEffect(() => {
    // Generate default clusters for the repair niche
    const smartphoneCluster = seoMachineAnalyzer.generateTopicCluster({
      pillarTopic: 'Réparation Smartphone',
      serviceType: 'smartphone',
      cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux']
    });

    const tabletteCluster = seoMachineAnalyzer.generateTopicCluster({
      pillarTopic: 'Réparation Tablette',
      serviceType: 'tablette',
      cities: ['Paris', 'Lyon', 'Nantes']
    });

    const ordinateurCluster = seoMachineAnalyzer.generateTopicCluster({
      pillarTopic: 'Réparation Ordinateur',
      serviceType: 'ordinateur',
      cities: ['Paris', 'Lille', 'Strasbourg']
    });

    setClusters([smartphoneCluster, tabletteCluster, ordinateurCluster]);
  }, []);

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Stratégie Topic Clusters
          </CardTitle>
          <CardDescription>
            Méthodologie SEO Machine : pages pilier + articles de support + maillage
          </CardDescription>
        </CardHeader>
      </Card>

      {clusters.map((cluster, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {cluster.pillarTopic}
            </CardTitle>
            <CardDescription>
              Page pilier: /{cluster.pillarSlug} • {cluster.supportingArticles.length} articles de support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Mot-clé cible</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cluster.supportingArticles.map((article, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{article.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">/{article.slug}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{article.targetKeyword}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status === 'published' ? 'Publié' : 'À créer'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <Link2 className="w-4 h-4" />
                Carte de maillage ({cluster.internalLinkingMap.length} liens)
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {cluster.internalLinkingMap.slice(0, 10).map((link, i) => (
                  <div key={i} className="text-xs flex items-center gap-1 text-muted-foreground">
                    <span className="truncate max-w-32">/{link.from}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-32">/{link.to}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Tab Maillage Interne
 */
function InternalLinkingTab() {
  const [meshStats, setMeshStats] = useState<{
    totalPages: number;
    totalLinks: number;
    avgLinksPerPage: number;
    orphanPages: number;
    topLinkedPages: { slug: string; title: string; incomingLinks: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const stats = await seoInternalLinking.getMeshStats();
      setMeshStats(stats);
      toast.success('Statistiques de maillage chargées');
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Maillage interne
        </h3>
        <Button onClick={loadStats} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {meshStats && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{meshStats.totalPages}</p>
                <p className="text-sm text-muted-foreground">Pages indexées</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{meshStats.totalLinks}</p>
                <p className="text-sm text-muted-foreground">Liens internes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{meshStats.avgLinksPerPage}</p>
                <p className="text-sm text-muted-foreground">Liens/page (moy.)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-destructive">{meshStats.orphanPages}</p>
                <p className="text-sm text-muted-foreground">Pages orphelines</p>
              </CardContent>
            </Card>
          </div>

          {meshStats.topLinkedPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pages les plus liées</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Liens entrants</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meshStats.topLinkedPages.map((page, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{page.slug}</TableCell>
                        <TableCell className="text-right">
                          <Badge>{page.incomingLinks}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {meshStats.orphanPages > 0 && (
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  <div>
                    <p className="font-medium">Pages orphelines détectées</p>
                    <p className="text-sm text-muted-foreground">
                      {meshStats.orphanPages} pages n'ont aucun lien entrant. 
                      Ajoutez des liens internes depuis d'autres pages pour améliorer leur visibilité.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Tab Analyse de Contenu
 */
function ContentAnalysisTab() {
  const contentChecklist = [
    { category: 'Structure', items: [
      'H1 unique contenant le mot-clé principal',
      'H2 pour chaque section majeure (minimum 3)',
      'H3 pour les sous-sections',
      'Paragraphes courts (3-4 phrases max)',
      'Listes à puces pour les énumérations'
    ]},
    { category: 'Contenu', items: [
      'Minimum 800 mots (1500+ pour contenu pilier)',
      'Mot-clé dans le premier paragraphe',
      'Densité mot-clé entre 1% et 3%',
      'Mots-clés LSI/synonymes utilisés',
      'Contenu original et unique'
    ]},
    { category: 'SEO On-Page', items: [
      'Title tag 30-60 caractères avec mot-clé',
      'Meta description 120-160 caractères avec CTA',
      'URL courte contenant le mot-clé',
      'Balise canonical configurée',
      'Schéma JSON-LD approprié (LocalBusiness, FAQPage, etc.)'
    ]},
    { category: 'Maillage interne', items: [
      'Minimum 3 liens internes par page',
      'Liens vers la page pilier du cluster',
      'Liens vers des pages de même thématique',
      'Ancres de liens variées et descriptives',
      'Liens depuis la navigation ou le footer'
    ]},
    { category: 'Expérience utilisateur', items: [
      'Temps de chargement < 3 secondes',
      'Responsive mobile-first',
      'Images optimisées avec alt text',
      'CTA clair et visible',
      'Breadcrumb pour la navigation'
    ]}
  ];

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Checklist SEO Machine
          </CardTitle>
          <CardDescription>
            Référentiel de bonnes pratiques pour chaque page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {contentChecklist.map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {section.category}
                </h4>
                <div className="space-y-1 pl-6">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stratégie de contenu SEO Machine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="font-medium text-foreground mb-1">1. Recherche de mots-clés</p>
            <p>Identifiez les mots-clés principaux (réparation + appareil + ville) et les mots-clés longue traîne associés.</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="font-medium text-foreground mb-1">2. Topic Clusters</p>
            <p>Créez une page pilier par thématique majeure, entourée d'articles de support qui renvoient vers elle.</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="font-medium text-foreground mb-1">3. Maillage interne</p>
            <p>Chaque page doit avoir 3-8 liens internes pertinents. Les pages pilier reçoivent le plus de liens.</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="font-medium text-foreground mb-1">4. Optimisation continue</p>
            <p>Auditez régulièrement vos pages avec le score SEO Machine. Visez un score ≥ 80 (grade A).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
