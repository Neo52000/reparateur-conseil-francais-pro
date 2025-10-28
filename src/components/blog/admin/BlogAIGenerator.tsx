import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Wand2 } from 'lucide-react';
import { useBlogAIGenerator } from '@/hooks/blog/useBlogAIGenerator';
import { useBlogCategories } from '@/hooks/blog/useBlogCategories';
import { BlogPost } from '@/types/blog';

interface BlogAIGeneratorProps {
  onArticleGenerated?: (post: BlogPost) => void;
}

const BlogAIGenerator: React.FC<BlogAIGeneratorProps> = ({ onArticleGenerated }) => {
  const { generating, generateArticle } = useBlogAIGenerator();
  const { fetchCategories } = useBlogCategories();

  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetAudience, setTargetAudience] = useState<'public' | 'repairers' | 'both'>('public');
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical' | 'educational'>('professional');
  const [autoPublish, setAutoPublish] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data || []);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      return;
    }

    const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);

    const post = await generateArticle({
      topic,
      category_id: categoryId && categoryId !== 'none' ? categoryId : undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      target_audience: targetAudience,
      tone,
      auto_publish: autoPublish,
      scheduled_at: scheduledAt || undefined
    });

    if (post && onArticleGenerated) {
      onArticleGenerated(post);
      // Reset form
      setTopic('');
      setKeywords('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Générateur IA d'Articles
        </CardTitle>
        <CardDescription>
          Créez des articles de blog complets automatiquement avec Lovable AI (Gemini 2.5)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Sujet de l'article *</Label>
          <Textarea
            id="topic"
            placeholder="Ex: Les meilleures pratiques pour remplacer un écran d'iPhone 15"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Mots-clés SEO (optionnel)</Label>
          <Input
            id="keywords"
            placeholder="réparation iPhone, écran cassé, tutoriel (séparés par virgules)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune catégorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Audience cible</Label>
            <Select value={targetAudience} onValueChange={(v: any) => setTargetAudience(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Grand public</SelectItem>
                <SelectItem value="repairers">Professionnels</SelectItem>
                <SelectItem value="both">Mixte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tonalité</Label>
          <Select value={tone} onValueChange={(v: any) => setTone(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professionnel</SelectItem>
              <SelectItem value="casual">Décontracté</SelectItem>
              <SelectItem value="technical">Technique</SelectItem>
              <SelectItem value="educational">Éducatif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="auto-publish">Publication automatique</Label>
            <p className="text-sm text-muted-foreground">
              Publier l'article immédiatement après génération
            </p>
          </div>
          <Switch
            id="auto-publish"
            checked={autoPublish}
            onCheckedChange={setAutoPublish}
          />
        </div>

        {!autoPublish && (
          <div className="space-y-2">
            <Label htmlFor="scheduled">Programmer la publication (optionnel)</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generating || !topic.trim()}
          className="w-full"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {generating ? 'Génération en cours...' : 'Générer l\'article'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Gratuit jusqu'au 13 octobre 2025 • Propulsé par Gemini 2.5 Flash
        </p>
      </CardContent>
    </Card>
  );
};

export default BlogAIGenerator;
