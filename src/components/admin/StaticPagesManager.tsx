
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye,
  Sparkles,
  Globe,
  Search
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import AIGenerationModal from './AIGenerationModal';
import StaticPageSEO from './StaticPageSEO';
import StaticPagePreview from './StaticPagePreview';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const StaticPagesManager: React.FC = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_published: false
  });

  // Charger les pages
  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Erreur chargement pages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les pages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentGenerated = (generatedContent: {
    title: string;
    meta_description: string;
    content: string;
    suggested_slug: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      title: generatedContent.title,
      meta_title: generatedContent.title,
      meta_description: generatedContent.meta_description,
      content: generatedContent.content,
      slug: prev.slug || generatedContent.suggested_slug
    }));
  };

  const handleNewPage = () => {
    setSelectedPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_published: false
    });
    setIsEditing(true);
  };

  const handleEditPage = (page: StaticPage) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      meta_keywords: page.meta_keywords || '',
      is_published: page.is_published
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre et le slug sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const pageData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        is_published: formData.is_published
      };

      let result;
      if (selectedPage) {
        // Mise à jour
        result = await supabase
          .from('static_pages')
          .update(pageData)
          .eq('id', selectedPage.id);
      } else {
        // Création
        result = await supabase
          .from('static_pages')
          .insert([pageData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Succès",
        description: selectedPage ? "Page mise à jour" : "Page créée",
      });

      fetchPages();
      setIsEditing(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la page",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: StaticPage) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la page "${page.title}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('static_pages')
        .delete()
        .eq('id', page.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Page supprimée",
      });

      fetchPages();
      if (selectedPage?.id === page.id) {
        setSelectedPage(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la page",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages statiques</h1>
          <p className="text-muted-foreground">
            Gérez le contenu des pages légales et institutionnelles
          </p>
        </div>
        <Button onClick={handleNewPage}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle page
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des pages */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pages existantes ({pages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune page créée</p>
                <p className="text-sm">Créez votre première page</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleEditPage(page)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{page.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          /{page.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {page.is_published && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(page);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Éditeur */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            {!isEditing ? (
              <div className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  Sélectionnez une page à modifier dans la liste
                </p>
              </div>
            ) : (
              <Tabs defaultValue="content" className="h-full">
                <div className="border-b px-6 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder="Titre de la page"
                        className="text-lg font-medium border-none px-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <AIGenerationModal onContentGenerated={handleContentGenerated}>
                        <Button variant="outline" size="sm">
                          <Sparkles className="w-4 h-4 mr-2" />
                          IA
                        </Button>
                      </AIGenerationModal>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </div>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content">Contenu</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="ai">IA</TabsTrigger>
                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="content" className="m-0 p-6">
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => handleFormChange('content', content)}
                    height="500px"
                  />
                </TabsContent>

                <TabsContent value="seo" className="m-0 p-6">
                  <StaticPageSEO
                    formData={formData}
                    onFormChange={handleFormChange}
                  />
                </TabsContent>

                <TabsContent value="ai" className="m-0 p-6">
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <h3 className="text-lg font-medium mb-2">Génération IA</h3>
                    <p className="text-muted-foreground mb-4">
                      Utilisez l'IA pour générer du contenu professionnel
                    </p>
                    <AIGenerationModal onContentGenerated={handleContentGenerated}>
                      <Button>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Générer du contenu
                      </Button>
                    </AIGenerationModal>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="m-0 p-6">
                  <StaticPagePreview
                    title={formData.meta_title || formData.title}
                    content={formData.content}
                    metaDescription={formData.meta_description}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaticPagesManager;
