import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  RefreshCw,
  Settings,
  Code,
  Image,
  Layout
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LandingPageEditor from './LandingPageEditor';
import AILandingPageEditor from './AILandingPageEditor';
import LandingPageTemplates from './LandingPageTemplates';
import LandingPagePreview from './LandingPagePreview';

interface LandingPage {
  id: string;
  name: string;
  template_type: string;
  config: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  template_config: any;
  preview_image_url?: string;
  is_active: boolean;
  created_at: string;
}

const LandingPagesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LandingPageTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPage, setNewPage] = useState({
    name: '',
    template_type: 'default',
    config: {}
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLandingPages();
    fetchTemplates();
  }, []);

  const fetchLandingPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les landing pages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_page_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createLandingPage = async () => {
    if (!newPage.name || !newPage.template_type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('landing_pages')
        .insert({
          name: newPage.name,
          template_type: newPage.template_type,
          config: newPage.config
        });

      if (error) throw error;

      toast({
        title: "Landing page créée",
        description: `${newPage.name} a été créée avec succès`
      });

      setIsCreateModalOpen(false);
      setNewPage({ name: '', template_type: 'default', config: {} });
      fetchLandingPages();
    } catch (error: any) {
      console.error('Error creating landing page:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la landing page",
        variant: "destructive"
      });
    }
  };

  const deleteLandingPage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette landing page ?')) return;

    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Landing page supprimée",
        description: "La landing page a été supprimée avec succès"
      });

      fetchLandingPages();
    } catch (error) {
      console.error('Error deleting landing page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la landing page",
        variant: "destructive"
      });
    }
  };

  const togglePageStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La landing page a été ${!currentStatus ? 'activée' : 'désactivée'}`
      });

      fetchLandingPages();
    } catch (error) {
      console.error('Error updating landing page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const duplicatePage = async (page: LandingPage) => {
    try {
      const { error } = await supabase
        .from('landing_pages')
        .insert({
          name: `${page.name} (Copie)`,
          template_type: page.template_type,
          config: page.config,
          is_active: false
        });

      if (error) throw error;

      toast({
        title: "Landing page dupliquée",
        description: "La copie a été créée avec succès"
      });

      fetchLandingPages();
    } catch (error) {
      console.error('Error duplicating landing page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer la landing page",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Landing Pages</h2>
          <p className="text-muted-foreground">Créez et gérez des landing pages personnalisées pour vos réparateurs</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchLandingPages} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Landing Pages
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Landing Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
                    <p className="text-2xl font-bold text-foreground">{landingPages.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pages Actives</p>
                    <p className="text-2xl font-bold text-foreground">
                      {landingPages.filter(p => p.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Layout className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Templates</p>
                    <p className="text-2xl font-bold text-foreground">{templates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">En Brouillon</p>
                    <p className="text-2xl font-bold text-foreground">
                      {landingPages.filter(p => !p.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une Landing Page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle Landing Page</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="page-name">Nom de la page</Label>
                    <Input
                      id="page-name"
                      value={newPage.name}
                      onChange={(e) => setNewPage({...newPage, name: e.target.value})}
                      placeholder="Ma Landing Page"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select value={newPage.template_type} onValueChange={(value) => setNewPage({...newPage, template_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Template par défaut</SelectItem>
                        <SelectItem value="garage">Garage Automobile</SelectItem>
                        <SelectItem value="smartphone">Réparation Smartphone</SelectItem>
                        <SelectItem value="electronics">Service Électronique</SelectItem>
                        <SelectItem value="custom">Template personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex gap-2">
                    <Button onClick={createLandingPage} className="flex-1">
                      Créer la page
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Landing Pages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Landing Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Chargement...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : landingPages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucune landing page trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    landingPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{page.template_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={page.is_active ? "default" : "secondary"}>
                            {page.is_active ? "Actif" : "Brouillon"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(page.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPage(page);
                                setIsPreviewOpen(true);
                              }}
                              title="Aperçu"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPage(page);
                                setIsEditorOpen(true);
                              }}
                              title="Modifier avec IA"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicatePage(page)}
                              title="Dupliquer"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePageStatus(page.id, page.is_active)}
                              title={page.is_active ? "Désactiver" : "Activer"}
                            >
                              {page.is_active ? "🔴" : "🟢"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLandingPage(page.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <LandingPageTemplates 
            templates={templates}
            onRefresh={fetchTemplates}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics des Landing Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Fonctionnalité en développement - Analytics et métriques des landing pages
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedPage && (
        <>
          {/* Editor Modal */}
          <AILandingPageEditor
            page={selectedPage}
            isOpen={isEditorOpen}
            onClose={() => {
              setIsEditorOpen(false);
              setSelectedPage(null);
            }}
            onSave={fetchLandingPages}
          />
          <LandingPagePreview
            page={selectedPage}
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setSelectedPage(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default LandingPagesManagement;