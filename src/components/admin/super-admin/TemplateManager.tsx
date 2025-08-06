import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Layout, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Copy,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  template_type: string;
  template_data: any;
  preview_image: string | null;
  is_active: boolean;
  is_premium: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    template_type: '',
    template_data: '{}',
    is_premium: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, categoryFilter, typeFilter]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ecommerce_templates' as any)
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates((data as unknown as Template[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(template => template.template_type === typeFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const templateData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        template_type: formData.template_type,
        template_data: JSON.parse(formData.template_data),
        is_premium: formData.is_premium,
        is_active: true,
        usage_count: 0
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('ecommerce_templates' as any)
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        
        toast({
          title: "Template mis à jour",
          description: "Le template a été mis à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('ecommerce_templates' as any)
          .insert([templateData]);

        if (error) throw error;
        
        toast({
          title: "Template créé",
          description: "Le template a été créé avec succès",
        });
      }

      setIsCreateModalOpen(false);
      setEditingTemplate(null);
      resetForm();
      await fetchTemplates();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      template_type: '',
      template_data: '{}',
      is_premium: false
    });
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      template_type: template.template_type,
      template_data: JSON.stringify(template.template_data, null, 2),
      is_premium: template.is_premium
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;

    try {
      const { error } = await supabase
        .from('ecommerce_templates' as any)
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès",
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('ecommerce_templates' as any)
        .insert([{
          name: `${template.name} (Copie)`,
          description: template.description,
          category: template.category,
          template_type: template.template_type,
          template_data: template.template_data,
          is_premium: template.is_premium,
          is_active: true,
          usage_count: 0
        }]);

      if (error) throw error;
      
      toast({
        title: "Template dupliqué",
        description: "Le template a été dupliqué avec succès",
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le template",
        variant: "destructive"
      });
    }
  };

  const categories = [...new Set(templates.map(t => t.category))];
  const types = [...new Set(templates.map(t => t.template_type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Templates</h2>
          <p className="text-muted-foreground">Templates E-commerce et POS</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTemplate(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Modifier le template' : 'Créer un nouveau template'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nom du template"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catégorie</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="pos">POS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="landing">Landing Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.template_type} onValueChange={(value) => setFormData({...formData, template_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theme">Thème</SelectItem>
                        <SelectItem value="component">Composant</SelectItem>
                        <SelectItem value="layout">Layout</SelectItem>
                        <SelectItem value="widget">Widget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="premium"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({...formData, is_premium: e.target.checked})}
                    />
                    <label htmlFor="premium" className="text-sm font-medium">Template Premium</label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description du template"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Données Template (JSON)</label>
                  <Textarea
                    value={formData.template_data}
                    onChange={(e) => setFormData({...formData, template_data: e.target.value})}
                    placeholder='{"colors": {"primary": "#007bff"}, "layout": "modern"}'
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {editingTemplate ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grille des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-admin-blue-light to-admin-purple-light flex items-center justify-center">
              {template.preview_image ? (
                <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
              ) : (
                <Layout className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm truncate flex-1">{template.name}</h3>
                <div className="flex gap-1 ml-2">
                  {template.is_premium && (
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  )}
                  <Badge variant="outline" className="text-xs capitalize">{template.category}</Badge>
                </div>
              </div>
              
              {template.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{template.usage_count} utilisations</span>
                <span className="capitalize">{template.template_type}</span>
              </div>
              
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(template)}>
                  <Edit3 className="h-3 w-3" />
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => handleDuplicate(template)}>
                  <Copy className="h-3 w-3" />
                </Button>
                
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(template.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun template trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' 
                ? "Aucun template ne correspond à vos critères de recherche."
                : "Commencez par créer votre premier template."}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateManager;