import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { useFooterConfig, FooterSection } from '@/hooks/useFooterConfig';
import { Plus, Edit, Trash2, Sparkles, Save, Eye, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

export default function FooterManager() {
  const { sections, loading, updateSection, createSection, deleteSection } = useFooterConfig();
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    content: '',
    links: [] as Array<{ title: string; url: string; className?: string }>,
    display_order: 0,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      section_key: '',
      title: '',
      content: '',
      links: [],
      display_order: 0,
      is_active: true
    });
    setEditingSection(null);
  };

  const openEditDialog = (section: FooterSection) => {
    setEditingSection(section);
    setFormData({
      section_key: section.section_key,
      title: section.title,
      content: section.content,
      links: section.links,
      display_order: section.display_order,
      is_active: section.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingSection) {
      await updateSection(editingSection.id, formData);
    } else {
      await createSection(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const generateWithAI = async () => {
    if (!formData.section_key) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une clé de section d'abord",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulation de génération IA - à remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiContent = {
        services: {
          title: "Nos Services",
          content: "Découvrez notre gamme complète de services de réparation professionnels, adaptés à tous vos appareils électroniques.",
                  links: [
                    { title: "Réparation Smartphone", url: "/services/reparation-smartphone" },
                    { title: "Réparation Tablette", url: "/services/reparation-tablette" },
                    { title: "Réparation Ordinateur", url: "/services/reparation-ordinateur" },
                    { title: "Réparation Console", url: "/services/reparation-console" }
                  ]
        },
        support: {
          title: "Support Client",
          content: "Notre équipe support est disponible pour vous aider et répondre à toutes vos questions.",
          links: [
            { title: "Centre d'aide", url: "/aide" },
            { title: "Contact", url: "/contact" },
            { title: "FAQ", url: "/faq" }
          ]
        }
      };

      const generated = aiContent[formData.section_key as keyof typeof aiContent];
      if (generated) {
        setFormData(prev => ({
          ...prev,
          title: generated.title,
          content: generated.content,
          links: generated.links
        }));
        
        toast({
          title: "Succès",
          description: "Contenu généré par l'IA avec succès"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du contenu",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '' }]
    }));
  };

  const updateLink = (index: number, field: 'title' | 'url' | 'className', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentSection = sections.find(s => s.id === sectionId);
    if (!currentSection) return;

    const otherSection = sections.find(s => 
      direction === 'up' 
        ? s.display_order < currentSection.display_order
        : s.display_order > currentSection.display_order
    );

    if (otherSection) {
      await updateSection(currentSection.id, { display_order: otherSection.display_order });
      await updateSection(otherSection.id, { display_order: currentSection.display_order });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Prévisualisation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Configuration du Footer</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Section
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Modifier la section' : 'Créer une nouvelle section'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="section_key">Clé de section</Label>
                  <Input
                    id="section_key"
                    value={formData.section_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, section_key: e.target.value }))}
                    placeholder="ex: services, support, legal"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Ordre d'affichage</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="title">Titre</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateWithAI}
                    disabled={isGenerating}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Génération...' : 'Générer avec IA'}
                  </Button>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la section"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Description de la section"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Liens</Label>
                  <Button size="sm" variant="outline" onClick={addLink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un lien
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.links.map((link, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        placeholder="Titre"
                        value={link.title}
                        onChange={(e) => updateLink(index, 'title', e.target.value)}
                        className="col-span-4"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="col-span-4"
                      />
                      <Input
                        placeholder="Classes CSS"
                        value={link.className || ''}
                        onChange={(e) => updateLink(index, 'className', e.target.value)}
                        className="col-span-3"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeLink(index)}
                        className="col-span-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Section active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

          <div className="grid gap-6">
            {sections
              .sort((a, b) => a.display_order - b.display_order)
              .map((section, index) => (
              <Card key={section.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === sections.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          {section.title}
                          <Badge variant={section.is_active ? "default" : "secondary"}>
                            {section.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Clé: {section.section_key} • Ordre: {section.display_order}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(section)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {section.content}
                  </p>
                  {section.links.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Liens ({section.links.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {section.links.map((link, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {link.title} → {link.url}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed">
            <h3 className="text-lg font-semibold mb-4 text-center">Prévisualisation du Footer</h3>
            <div className="bg-background rounded-lg shadow-lg overflow-hidden">
              <Footer />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Cette prévisualisation montre le footer tel qu'il apparaît sur le site
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}