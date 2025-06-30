
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Wand2, Play, RefreshCw } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';
import { BlogGenerationTemplate, BlogCategory } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BlogTemplatesManager: React.FC = () => {
  const { fetchCategories } = useBlog();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<BlogGenerationTemplate[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BlogGenerationTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    visibility: 'public' as 'public' | 'repairers' | 'both',
    prompt_template: '',
    ai_model: 'openai',
    is_active: true
  });

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_generation_templates')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as BlogGenerationTemplate[]);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      });
    }
  };

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      visibility: 'public',
      prompt_template: '',
      ai_model: 'openai',
      is_active: true
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template: BlogGenerationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category_id: template.category_id || '',
      visibility: template.visibility,
      prompt_template: template.prompt_template,
      ai_model: template.ai_model,
      is_active: template.is_active
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.prompt_template) {
      toast({
        title: "Erreur",
        description: "Le nom et le template sont requis",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('blog_generation_templates')
          .update(formData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Template mis à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('blog_generation_templates')
          .insert(formData);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Template créé avec succès"
        });
      }

      setShowDialog(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_generation_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Succès",
        description: "Template supprimé avec succès"
      });
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
    }
  };

  const generateArticle = async (template: BlogGenerationTemplate) => {
    console.log('🚀 Starting article generation with template:', template.name);
    setIsGenerating(template.id);
    
    try {
      console.log('📝 Calling generate-blog-content function with:', {
        template_id: template.id,
        ai_model: template.ai_model,
        category_id: template.category_id,
        visibility: template.visibility
      });

      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: {
          template_id: template.id,
          ai_model: template.ai_model,
          category_id: template.category_id,
          visibility: template.visibility
        }
      });

      console.log('📊 Function response:', { data, error });

      if (error) {
        console.error('❌ Function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('❌ Response error:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ Article generated successfully:', data);
      toast({
        title: "Succès",
        description: "Article généré avec succès ! Consultez la liste des articles."
      });
    } catch (error) {
      console.error('❌ Error generating article:', error);
      toast({
        title: "Erreur",
        description: `Impossible de générer l'article: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Templates de génération IA
            </CardTitle>
            <CardDescription>
              Créez des templates pour générer automatiquement du contenu avec l'IA
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
                </DialogTitle>
                <DialogDescription>
                  Configurez les paramètres de génération automatique d'articles
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du template</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom descriptif"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai_model">Modèle IA</Label>
                    <Select value={formData.ai_model} onValueChange={(value) => setFormData(prev => ({ ...prev, ai_model: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                        <SelectItem value="mistral">Mistral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="visibility">Visibilité</Label>
                    <Select 
                      value={formData.visibility} 
                      onValueChange={(value: 'public' | 'repairers' | 'both') => 
                        setFormData(prev => ({ ...prev, visibility: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="repairers">Réparateurs uniquement</SelectItem>
                        <SelectItem value="both">Les deux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="prompt_template">Template de prompt</Label>
                  <Textarea
                    id="prompt_template"
                    value={formData.prompt_template}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt_template: e.target.value }))}
                    placeholder="Écris un article de blog sur {sujet} pour les réparateurs de smartphones..."
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Utilisez des variables comme {`{sujet}`}, {`{tendance}`}, {`{saison}`} pour personnaliser
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Template actif</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave}>
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Modèle IA</TableHead>
                <TableHead>Visibilité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.category?.name || 'Non catégorisé'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.ai_model}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{template.visibility}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => generateArticle(template)}
                        disabled={isGenerating === template.id}
                        title="Générer un article"
                      >
                        {isGenerating === template.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(template)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogTemplatesManager;
