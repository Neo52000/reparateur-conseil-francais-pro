import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Plus, 
  ExternalLink, 
  Edit, 
  Eye, 
  Share,
  Copy,
  CheckCircle,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const StatusPages: React.FC = () => {
  const { user } = useAuth();
  const [statusPages, setStatusPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchStatusPages();
  }, [user]);

  const fetchStatusPages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('status_pages')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatusPages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des pages de statut:', error);
      toast.error('Erreur lors du chargement des pages de statut');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Lien copié dans le presse-papiers');
  };

  const generateStatusPageUrl = (slug: string) => {
    return `https://topreparateurs.fr/status/${slug}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Chargement des pages de statut...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pages de Statut</h2>
          <p className="text-muted-foreground">
            Créez des pages publiques pour informer vos clients de l'état de vos services
          </p>
          <Badge className="mt-2 bg-primary/10 text-primary">
            Fonctionnalité exclusive TopReparateurs
          </Badge>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle page de statut
        </Button>
      </div>

      {/* Créer une nouvelle page */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une page de statut</CardTitle>
            <CardDescription>
              Configurez une page publique pour communiquer sur l'état de vos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la page</Label>
                  <Input
                    id="name"
                    placeholder="Status - Mon Atelier"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL personnalisée</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      topreparateurs.fr/status/
                    </span>
                    <Input
                      id="slug"
                      placeholder="mon-atelier"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Statut en temps réel de nos services de réparation"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="public">Page publique</Label>
                <Switch id="public" defaultChecked />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Créer la page
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des pages existantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusPages.length > 0 ? statusPages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {page.name}
                  </CardTitle>
                  <CardDescription>
                    {page.description || 'Aucune description'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {page.is_public ? (
                    <Badge className="bg-success/10 text-success">Public</Badge>
                  ) : (
                    <Badge variant="secondary">Privé</Badge>
                  )}
                  {page.is_active && (
                    <Badge className="bg-primary/10 text-primary">Actif</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <code className="text-sm">{generateStatusPageUrl(page.slug)}</code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(generateStatusPageUrl(page.slug))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Statut simulé */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-success/10 rounded">
                    <CheckCircle className="h-4 w-4 mx-auto text-success mb-1" />
                    <div className="text-xs font-medium">Site Web</div>
                    <div className="text-xs text-success">Opérationnel</div>
                  </div>
                  <div className="p-2 bg-success/10 rounded">
                    <CheckCircle className="h-4 w-4 mx-auto text-success mb-1" />
                    <div className="text-xs font-medium">E-commerce</div>
                    <div className="text-xs text-success">Opérationnel</div>
                  </div>
                  <div className="p-2 bg-success/10 rounded">
                    <CheckCircle className="h-4 w-4 mx-auto text-success mb-1" />
                    <div className="text-xs font-medium">POS</div>
                    <div className="text-xs text-success">Opérationnel</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="lg:col-span-2">
            <CardContent className="text-center py-12">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune page de statut</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre première page de statut pour tenir vos clients informés
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une page de statut
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Avantages des pages de statut */}
      <Card>
        <CardHeader>
          <CardTitle>Pourquoi utiliser les pages de statut ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">Transparence</h4>
              <p className="text-sm text-muted-foreground">
                Informez proactivement vos clients sur l'état de vos services
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">Confiance</h4>
              <p className="text-sm text-muted-foreground">
                Montrez votre fiabilité avec un historique de disponibilité
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-3">
                <Share className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">Communication</h4>
              <p className="text-sm text-muted-foreground">
                Réduisez les demandes support en communiquant proactivement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};