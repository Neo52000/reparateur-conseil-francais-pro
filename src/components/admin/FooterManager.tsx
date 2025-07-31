import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useFooterConfig, FooterSection } from '@/hooks/useFooterConfig';
import { Plus, Edit, Trash2, Sparkles, Save, Eye, GripVertical, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { NavigationService } from '@/services/navigationService';
export default function FooterManager() {
  const {
    sections,
    loading,
    updateSection,
    createSection,
    deleteSection,
    reorderSections
  } = useFooterConfig();
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    content: '',
    links: [] as Array<{
      title: string;
      url: string;
      className?: string;
    }>,
    display_order: 0,
    is_active: true,
    parent_id: null as string | null
  });
  const resetForm = () => {
    setFormData({
      section_key: '',
      title: '',
      content: '',
      links: [],
      display_order: 0,
      is_active: true,
      parent_id: null
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
      is_active: section.is_active,
      parent_id: section.parent_id || null
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aiContent = {
        services: {
          title: "Nos Services",
          content: "Découvrez notre gamme complète de services de réparation professionnels.",
          links: [{
            title: "Réparation Smartphone",
            url: "/reparation-smartphone"
          }, {
            title: "Réparation Tablette",
            url: "/reparation-tablette"
          }, {
            title: "Réparation Ordinateur",
            url: "/reparation-ordinateur"
          }, {
            title: "Réparation Console",
            url: "/reparation-console"
          }]
        },
        support: {
          title: "Support Client",
          content: "Notre équipe support est disponible pour vous aider.",
          links: [{
            title: "Centre d'aide",
            url: "/aide"
          }, {
            title: "Contact",
            url: "/contact"
          }, {
            title: "FAQ",
            url: "/faq"
          }]
        },
        legal: {
          title: "Informations Légales",
          content: "Toutes nos mentions légales et politiques.",
          links: [{
            title: "Mentions légales",
            url: "/mentions-legales"
          }, {
            title: "Politique de confidentialité",
            url: "/politique-confidentialite"
          }, {
            title: "CGU",
            url: "/cgu"
          }, {
            title: "CGV",
            url: "/cgv"
          }]
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
      links: [...prev.links, {
        title: '',
        url: ''
      }]
    }));
  };
  const updateLink = (index: number, field: 'title' | 'url' | 'className', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? {
        ...link,
        [field]: value
      } : link)
    }));
  };
  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const parentId = result.destination.droppableId === 'root' ? null : result.destination.droppableId;
    await reorderSections(result.source.index, result.destination.index, parentId);
  };
  const isLinkValid = (url: string) => {
    if (!url) return true; // Les liens vides sont OK pendant l'édition
    return NavigationService.isValidRoute(url) || NavigationService.isValidExternalUrl(url);
  };
  const getParentSections = () => {
    return sections.filter(s => !s.parent_id);
  };
  const getChildSections = (parentId: string) => {
    return sections.filter(s => s.parent_id === parentId);
  };
  const renderSectionCard = (section: FooterSection, provided?: any, snapshot?: any) => <Card key={section.id} className={`relative ${snapshot?.isDragging ? 'rotate-2 shadow-xl' : ''}`} ref={provided?.innerRef} {...provided?.draggableProps}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div {...provided?.dragHandleProps}>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {section.title}
                <Badge variant={section.is_active ? "default" : "secondary"}>
                  {section.is_active ? 'Actif' : 'Inactif'}
                </Badge>
                {section.parent_id && <Badge variant="outline" className="text-xs">
                    Sous-section
                  </Badge>}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Clé: {section.section_key} • Ordre: {section.display_order}
                {section.parent_id && <span className="ml-2">
                    • Parent: {sections.find(s => s.id === section.parent_id)?.title}
                  </span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => openEditDialog(section)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteSection(section.id)}>
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
        {section.links.length > 0 && <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              Liens ({section.links.length})
              {section.links.some(link => !isLinkValid(link.url)) && <AlertTriangle className="h-4 w-4 text-warning" />}
            </h4>
            <div className="space-y-1">
              {section.links.map((link, index) => <div key={index} className="flex items-center gap-2 text-xs">
                  <Badge variant={isLinkValid(link.url) ? "outline" : "destructive"} className="flex items-center gap-1">
                    {!isLinkValid(link.url) && <AlertTriangle className="h-3 w-3" />}
                    {link.title} → {link.url}
                    <ExternalLink className="h-3 w-3" />
                  </Badge>
                </div>)}
            </div>
          </div>}
      </CardContent>
    </Card>;
  if (loading) {
    return <div>Chargement...</div>;
  }
  return <div className="space-y-6">
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
          

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="root" type="SECTION">
              {provided => <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                  {getParentSections().sort((a, b) => a.display_order - b.display_order).map((section, index) => <div key={section.id}>
                      <Draggable draggableId={section.id} index={index}>
                        {(provided, snapshot) => renderSectionCard(section, provided, snapshot)}
                      </Draggable>
                      
                      {getChildSections(section.id).length > 0 && <Droppable droppableId={section.id} type="SUBSECTION">
                          {provided => <div {...provided.droppableProps} ref={provided.innerRef} className="ml-8 mt-4 space-y-4 border-l-2 border-muted pl-4">
                              {getChildSections(section.id).sort((a, b) => a.display_order - b.display_order).map((childSection, childIndex) => <Draggable key={childSection.id} draggableId={childSection.id} index={childIndex}>
                                  {(provided, snapshot) => renderSectionCard(childSection, provided, snapshot)}
                                </Draggable>)}
                              {provided.placeholder}
                            </div>}
                        </Droppable>}
                    </div>)}
                  {provided.placeholder}
                </div>}
            </Droppable>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed">
            <h3 className="text-lg font-semibold mb-4 text-center">Prévisualisation en temps réel</h3>
            <div className="bg-background rounded-lg shadow-lg overflow-hidden">
              <Footer />
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="text-center">
                Glissez-déposez les sections dans l'onglet Configuration pour les réorganiser
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Liens valides
                </Badge>
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Liens cassés
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}