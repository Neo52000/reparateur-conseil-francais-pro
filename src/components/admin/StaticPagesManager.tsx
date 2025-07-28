import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Save, X, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';
import AIGenerationModal from './AIGenerationModal';

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const StaticPagesManager = () => {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: false
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error }: { data: any[], error: any } = await supabase
        .from('static_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
      toast.error('Erreur lors du chargement des pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.slug || !formData.title || !formData.content) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const pageData = {
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        title: formData.title,
        content: formData.content,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        is_published: formData.is_published
      };

      if (editingPage) {
        // Mise à jour
        const { error } = await supabase
          .from('static_pages')
          .update(pageData)
          .eq('id', editingPage.id);

        if (error) throw error;
        toast.success('Page mise à jour avec succès');
      } else {
        // Création
        const { error } = await supabase
          .from('static_pages')
          .insert([pageData]);

        if (error) throw error;
        toast.success('Page créée avec succès');
      }

      setEditingPage(null);
      setIsCreating(false);
      resetForm();
      loadPages();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      if (error.code === '23505') {
        toast.error('Une page avec ce slug existe déjà');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    }
  };

  const handleEdit = (page: StaticPage) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published
    });
    setIsCreating(false);
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const { error } = await supabase
        .from('static_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      toast.success('Page supprimée avec succès');
      loadPages();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCancel = () => {
    setEditingPage(null);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      meta_title: '',
      meta_description: '',
      is_published: false
    });
  };

  const handleAIGeneration = (generatedContent: {
    title: string;
    meta_description: string;
    content: string;
    suggested_slug: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      title: generatedContent.title,
      content: generatedContent.content,
      meta_description: generatedContent.meta_description,
      slug: generatedContent.suggested_slug,
      meta_title: generatedContent.title
    }));
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingPage(null);
    resetForm();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Pages Statiques</h2>
        <div className="flex gap-2">
          <AIGenerationModal onContentGenerated={handleAIGeneration}>
            <Button variant="outline" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Générer avec l'IA
            </Button>
          </AIGenerationModal>
          <Button onClick={startCreating} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Page
          </Button>
        </div>
      </div>

      {(isCreating || editingPage) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPage ? 'Modifier la page' : 'Créer une nouvelle page'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="ai">IA</TabsTrigger>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">URL/Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="mentions-legales"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Mentions légales"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Contenu *</Label>
                    <AIGenerationModal onContentGenerated={handleAIGeneration}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Générer
                      </Button>
                    </AIGenerationModal>
                  </div>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Commencez à écrire le contenu de votre page..."
                    height="500px"
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Titre pour les moteurs de recherche (max 60 caractères)"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.meta_title.length}/60 caractères
                  </p>
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                  <Input
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Description pour les moteurs de recherche (max 160 caractères)"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.meta_description.length}/160 caractères
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 mt-6">
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Génération IA</h3>
                  <p className="text-muted-foreground mb-4">
                    Utilisez l'intelligence artificielle pour générer du contenu optimisé pour votre page.
                  </p>
                  <AIGenerationModal onContentGenerated={handleAIGeneration}>
                    <Button className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Générer du contenu
                    </Button>
                  </AIGenerationModal>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <div className="border rounded-lg p-6 bg-background">
                  <h1 className="text-2xl font-bold mb-4">{formData.title || 'Titre de la page'}</h1>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formData.content || '<p>Aucun contenu à prévisualiser</p>' 
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Page publiée</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{page.title}</h3>
                    <Badge variant={page.is_published ? "default" : "secondary"}>
                      {page.is_published ? "Publiée" : "Brouillon"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    URL: /{page.slug}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dernière modification: {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {page.is_published && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${page.slug}`, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(page)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                    className="flex items-center gap-1 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Aucune page créée pour le moment.</p>
            <Button onClick={startCreating} className="mt-4">
              Créer la première page
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaticPagesManager;