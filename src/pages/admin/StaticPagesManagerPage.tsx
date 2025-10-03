import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import AIGenerationModal from '@/components/admin/AIGenerationModal';
import { Loader2, Save, ArrowLeft, Sparkles, Eye, Edit2, Plus } from 'lucide-react';

interface ServicePage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  hero_title: string;
  hero_subtitle: string | null;
  content: any;
  cta_text: string | null;
  cta_link: string | null;
  is_published: boolean;
  ai_generated: boolean;
  ai_model: string | null;
}

const StaticPagesManagerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [pages, setPages] = useState<ServicePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ServicePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadPages();
  }, [isAdmin, navigate]);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('static_service_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les pages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIGeneration = async (content: {
    title: string;
    meta_description: string;
    content: string;
    suggested_slug: string;
  }) => {
    if (!selectedPage) return;

    setSelectedPage({
      ...selectedPage,
      title: content.title,
      meta_description: content.meta_description,
      hero_title: content.title,
      hero_subtitle: content.meta_description,
      ai_generated: true
    });

    toast({
      title: 'Contenu généré',
      description: 'Le contenu a été généré par IA. N\'oubliez pas de sauvegarder.'
    });
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('static_service_pages')
        .update({
          title: selectedPage.title,
          meta_description: selectedPage.meta_description,
          hero_title: selectedPage.hero_title,
          hero_subtitle: selectedPage.hero_subtitle,
          cta_text: selectedPage.cta_text,
          cta_link: selectedPage.cta_link,
          is_published: selectedPage.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPage.id);

      if (error) throw error;

      toast({
        title: 'Sauvegardé',
        description: 'La page a été mise à jour avec succès'
      });

      await loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la page',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gestion des Pages de Services | Admin</title>
      </Helmet>

      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => selectedPage ? setSelectedPage(null) : navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Pages de Services</h1>
              <p className="text-muted-foreground">Gérez le contenu des pages de services avec l'IA</p>
            </div>
          </div>
        </div>

        {!selectedPage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Card key={page.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                      <CardDescription className="mt-2">/{page.slug}</CardDescription>
                    </div>
                    <Badge variant={page.is_published ? 'default' : 'secondary'}>
                      {page.is_published ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                  {page.ai_generated && (
                    <Badge variant="premium" className="w-fit mt-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Généré par IA
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {page.meta_description || 'Aucune description'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${page.slug}`, '_blank')}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedPage(page)}
                      className="flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Édition: {selectedPage.title}</CardTitle>
                  <CardDescription>/{selectedPage.slug}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <AIGenerationModal onContentGenerated={handleAIGeneration}>
                    <Button variant="outline" size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer avec IA
                    </Button>
                  </AIGenerationModal>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-base font-medium">Publication</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPage.is_published ? 'Page visible publiquement' : 'Page en brouillon'}
                  </p>
                </div>
                <Switch
                  checked={selectedPage.is_published}
                  onCheckedChange={(checked) =>
                    setSelectedPage({ ...selectedPage, is_published: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre de la page</Label>
                <Input
                  id="title"
                  value={selectedPage.title}
                  onChange={(e) =>
                    setSelectedPage({ ...selectedPage, title: e.target.value })
                  }
                  placeholder="Titre de la page"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                <Textarea
                  id="meta_description"
                  value={selectedPage.meta_description || ''}
                  onChange={(e) =>
                    setSelectedPage({ ...selectedPage, meta_description: e.target.value })
                  }
                  placeholder="Description pour les moteurs de recherche (160 caractères max)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_title">Titre Hero</Label>
                <Input
                  id="hero_title"
                  value={selectedPage.hero_title}
                  onChange={(e) =>
                    setSelectedPage({ ...selectedPage, hero_title: e.target.value })
                  }
                  placeholder="Titre principal affiché sur la page"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">Sous-titre Hero</Label>
                <Textarea
                  id="hero_subtitle"
                  value={selectedPage.hero_subtitle || ''}
                  onChange={(e) =>
                    setSelectedPage({ ...selectedPage, hero_subtitle: e.target.value })
                  }
                  placeholder="Sous-titre affiché sous le titre principal"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_text">Texte CTA</Label>
                  <Input
                    id="cta_text"
                    value={selectedPage.cta_text || ''}
                    onChange={(e) =>
                      setSelectedPage({ ...selectedPage, cta_text: e.target.value })
                    }
                    placeholder="Texte du bouton d'action"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta_link">Lien CTA</Label>
                  <Input
                    id="cta_link"
                    value={selectedPage.cta_link || ''}
                    onChange={(e) =>
                      setSelectedPage({ ...selectedPage, cta_link: e.target.value })
                    }
                    placeholder="/lien-vers-page"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
};

export default StaticPagesManagerPage;
