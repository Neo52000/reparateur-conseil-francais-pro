import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Copy, 
  Star,
  Package,
  Smartphone,
  Wrench
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  preview_image_url: string;
  template_data: any;
  category: string;
  is_premium: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    is_premium: false,
    template_data: '{}'
  });
  const { toast } = useToast();

  const categories = [
    { value: 'general', label: 'Général', icon: Package },
    { value: 'parts', label: 'Pièces détachées', icon: Wrench },
    { value: 'electronics', label: 'Électronique', icon: Smartphone },
    { value: 'services', label: 'Services', icon: Star }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ecommerce_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        is_premium: formData.is_premium,
        template_data: JSON.parse(formData.template_data || '{}')
      };

      if (editingTemplate) {
        // Mise à jour
        const { error } = await supabase
          .from('ecommerce_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        
        toast({
          title: "Template mis à jour",
          description: "Le template a été mis à jour avec succès",
        });
      } else {
        // Création
        const { error } = await supabase
          .from('ecommerce_templates')
          .insert([templateData]);

        if (error) throw error;
        
        toast({
          title: "Template créé",
          description: "Le template a été créé avec succès",
        });
      }

      setIsCreateModalOpen(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        category: 'general',
        is_premium: false,
        template_data: '{}'
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      is_premium: template.is_premium,
      template_data: JSON.stringify(template.template_data, null, 2)
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;

    try {
      const { error } = await supabase
        .from('ecommerce_templates')
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
        .from('ecommerce_templates')
        .insert([{
          name: `${template.name} (Copie)`,
          description: template.description,
          category: template.category,
          is_premium: false,
          template_data: template.template_data
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

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    const IconComponent = cat?.icon || Package;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Templates E-commerce</h2>
          <p className="text-muted-foreground">Créer et gérer les templates de boutiques</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTemplate(null);
              setFormData({
                name: '',
                description: '',
                category: 'general',
                is_premium: false,
                template_data: '{}'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Modifier le template' : 'Créer un nouveau template'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du template</label>       
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom du template"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category.value)}
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du template"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Configuration JSON</label>
                <Textarea
                  value={formData.template_data}
                  onChange={(e) => setFormData({ ...formData, template_data: e.target.value })}
                  placeholder="Configuration JSON du template"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="premium"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                />
                <label htmlFor="premium" className="text-sm">Template premium</label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
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

      {isLoading && templates.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="admin-card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.is_premium && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description || 'Aucune description'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Utilisé {template.usage_count} fois</span>
                  <span>
                    {categories.find(c => c.value === template.category)?.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
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
                    variant="destructive" 
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;