import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Layout, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  RefreshCw,
  Car,
  Smartphone,
  Laptop,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  template_config: any;
  preview_image_url?: string;
  is_active: boolean;
  created_at: string;
}

interface LandingPageTemplatesProps {
  templates: LandingPageTemplate[];
  onRefresh: () => void;
}

const LandingPageTemplates: React.FC<LandingPageTemplatesProps> = ({ templates, onRefresh }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    template_config: {}
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const predefinedTemplates = [
    {
      name: "Garage Automobile",
      description: "Template optimisé pour les garages et ateliers de réparation automobile",
      icon: Car,
      template_config: {
        hero: {
          title: "Votre Garage de Confiance",
          subtitle: "Réparation et entretien automobile par des professionnels certifiés",
          background_image: "/api/placeholder/1200/600?text=Garage+Auto",
          cta_text: "Prendre RDV",
          cta_url: "#contact"
        },
        about: {
          title: "Notre Expertise Automobile",
          description: "Avec plus de 20 ans d'expérience, notre équipe de mécaniciens qualifiés assure l'entretien et la réparation de tous types de véhicules.",
          image: "/api/placeholder/400/300?text=Mechanic"
        },
        services: {
          title: "Nos Services",
          items: [
            { name: "Révision complète", description: "Contrôle technique et vidange", price: "À partir de 120€" },
            { name: "Réparation moteur", description: "Diagnostic et réparation", price: "Sur devis" },
            { name: "Climatisation", description: "Recharge et entretien", price: "À partir de 80€" }
          ]
        },
        style: {
          primary_color: "#dc2626",
          secondary_color: "#374151",
          font_family: "Roboto"
        }
      }
    },
    {
      name: "Réparation Smartphone",
      description: "Template spécialisé pour les réparateurs de téléphones et tablettes",
      icon: Smartphone,
      template_config: {
        hero: {
          title: "Réparation Express de Smartphones",
          subtitle: "Réparation rapide et garantie de votre téléphone en moins de 30 minutes",
          background_image: "/api/placeholder/1200/600?text=Phone+Repair",
          cta_text: "Demander un devis",
          cta_url: "#contact"
        },
        about: {
          title: "Experts en Réparation Mobile",
          description: "Spécialistes certifiés dans la réparation de smartphones, tablettes et montres connectées. Pièces d'origine garanties.",
          image: "/api/placeholder/400/300?text=Smartphone+Repair"
        },
        services: {
          title: "Nos Réparations",
          items: [
            { name: "Écran cassé", description: "Remplacement écran LCD/OLED", price: "À partir de 79€" },
            { name: "Batterie", description: "Changement batterie", price: "À partir de 49€" },
            { name: "Caméra", description: "Réparation appareil photo", price: "À partir de 69€" }
          ]
        },
        style: {
          primary_color: "#2563eb",
          secondary_color: "#64748b",
          font_family: "Inter"
        }
      }
    },
    {
      name: "Service Électronique",
      description: "Template pour les réparateurs d'électronique générale",
      icon: Laptop,
      template_config: {
        hero: {
          title: "Réparation Électronique Professionnelle",
          subtitle: "Dépannage et réparation de tous vos appareils électroniques",
          background_image: "/api/placeholder/1200/600?text=Electronics",
          cta_text: "Diagnostic gratuit",
          cta_url: "#contact"
        },
        about: {
          title: "Techniciens Experts",
          description: "Notre équipe de techniciens spécialisés répare ordinateurs, consoles, TV et électroménager avec des pièces de qualité.",
          image: "/api/placeholder/400/300?text=Electronics+Repair"
        },
        services: {
          title: "Nos Spécialités",
          items: [
            { name: "Ordinateurs", description: "Réparation PC et Mac", price: "Diagnostic gratuit" },
            { name: "Consoles", description: "PlayStation, Xbox, Nintendo", price: "À partir de 59€" },
            { name: "Télévisions", description: "Réparation écrans et cartes", price: "Sur devis" }
          ]
        },
        style: {
          primary_color: "#7c3aed",
          secondary_color: "#6b7280",
          font_family: "Open Sans"
        }
      }
    }
  ];

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('landing_page_templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          template_config: newTemplate.template_config
        });

      if (error) throw error;

      toast({
        title: "Template créé",
        description: `${newTemplate.name} a été créé avec succès`
      });

      setIsCreateModalOpen(false);
      setNewTemplate({ name: '', description: '', template_config: {} });
      onRefresh();
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPredefinedTemplate = async (template: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('landing_page_templates')
        .insert({
          name: template.name,
          description: template.description,
          template_config: template.template_config
        });

      if (error) throw error;

      toast({
        title: "Template ajouté",
        description: `${template.name} a été ajouté à vos templates`
      });

      onRefresh();
    } catch (error: any) {
      console.error('Error creating predefined template:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;

    try {
      const { error } = await supabase
        .from('landing_page_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Template supprimé",
        description: "Le template a été supprimé avec succès"
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Templates de Landing Pages</h3>
          <p className="text-muted-foreground">Gérez vos templates et utilisez nos modèles prédéfinis</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nom du template</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="Mon Template Personnalisé"
                />
              </div>
              
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Description du template..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createTemplate} disabled={loading} className="flex-1">
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Créer le template
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Predefined Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Templates Prédéfinis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predefinedTemplates.map((template, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <template.icon className="w-8 h-8 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => createPredefinedTemplate(template)}
                        disabled={loading}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Utiliser
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Templates Personnalisés</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun template personnalisé</p>
              <p className="text-sm">Créez votre premier template pour commencer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="relative">
                  {template.preview_image_url && (
                    <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                      <img
                        src={template.preview_image_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" title="Aperçu">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Modifier">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Dupliquer">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteTemplate(template.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPageTemplates;