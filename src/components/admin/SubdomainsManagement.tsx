import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subdomain {
  id: string;
  subdomain: string;
  repairer_id: string;
  landing_page_id?: string;
  is_active: boolean;
  custom_domain?: string;
  ssl_enabled: boolean;
  dns_configured: boolean;
  created_at: string;
  repairer_name?: string;
  subscription_tier?: string;
  landing_page_name?: string;
}

interface Repairer {
  id: string;
  name: string;
  subscription_tier: string;
  subscribed: boolean;
}

interface LandingPage {
  id: string;
  name: string;
  is_active: boolean;
}

const SubdomainsManagement: React.FC = () => {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSubdomain, setNewSubdomain] = useState({
    subdomain: '',
    repairer_id: '',
    landing_page_id: '',
    custom_domain: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubdomains();
    fetchRepairers();
    fetchLandingPages();
  }, []);

  const fetchSubdomains = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subdomains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Enrichir avec les données des réparateurs et landing pages
      const enrichedData = await Promise.all(
        (data || []).map(async (subdomain) => {
          const { data: repairerData } = await supabase
            .from('repairer_subscriptions')
            .select('email, subscription_tier')
            .eq('repairer_id', subdomain.repairer_id)
            .single();
          
          let landingPageName = '';
          if (subdomain.landing_page_id) {
            const { data: landingPageData } = await supabase
              .from('landing_pages')
              .select('name')
              .eq('id', subdomain.landing_page_id)
              .single();
            landingPageName = landingPageData?.name || '';
          }
          
          return {
            ...subdomain,
            repairer_name: repairerData?.email || 'Inconnu',
            subscription_tier: repairerData?.subscription_tier || 'free',
            landing_page_name: landingPageName
          };
        })
      );
      
      setSubdomains(enrichedData);
    } catch (error) {
      console.error('Error fetching subdomains:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sous-domaines",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairers = async () => {
    try {
      const { data, error } = await supabase
        .from('repairer_subscriptions')
        .select('repairer_id, email, subscription_tier, subscribed')
        .eq('subscribed', true)
        .in('subscription_tier', ['basic', 'pro', 'premium', 'enterprise']);

      if (error) throw error;
      
      const formattedRepairers = data?.map(item => ({
        id: item.repairer_id,
        name: item.email, // Utiliser l'email en attendant d'avoir les noms
        subscription_tier: item.subscription_tier,
        subscribed: item.subscribed
      })) || [];
      
      setRepairers(formattedRepairers);
    } catch (error) {
      console.error('Error fetching repairers:', error);
    }
  };

  const fetchLandingPages = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
    }
  };

  const createSubdomain = async () => {
    if (!newSubdomain.subdomain || !newSubdomain.repairer_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subdomains')
        .insert({
          subdomain: newSubdomain.subdomain.toLowerCase(),
          repairer_id: newSubdomain.repairer_id,
          landing_page_id: newSubdomain.landing_page_id === 'none' ? null : newSubdomain.landing_page_id || null,
          custom_domain: newSubdomain.custom_domain || null
        });

      if (error) throw error;

      toast({
        title: "Sous-domaine créé",
        description: `${newSubdomain.subdomain}.votre-domaine.com a été créé avec succès`
      });

      setIsCreateModalOpen(false);
      setNewSubdomain({ subdomain: '', repairer_id: '', landing_page_id: '', custom_domain: '' });
      fetchSubdomains();
    } catch (error: any) {
      console.error('Error creating subdomain:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le sous-domaine",
        variant: "destructive"
      });
    }
  };

  const toggleSubdomainStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subdomains')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Le sous-domaine a été ${!currentStatus ? 'activé' : 'désactivé'}`
      });

      fetchSubdomains();
    } catch (error) {
      console.error('Error updating subdomain:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const deleteSubdomain = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sous-domaine ?')) return;

    try {
      const { error } = await supabase
        .from('subdomains')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sous-domaine supprimé",
        description: "Le sous-domaine a été supprimé avec succès"
      });

      fetchSubdomains();
    } catch (error) {
      console.error('Error deleting subdomain:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le sous-domaine",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (subdomain: Subdomain) => {
    if (!subdomain.is_active) {
      return <Badge variant="secondary">Inactif</Badge>;
    }
    if (!subdomain.dns_configured) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">DNS en attente</Badge>;
    }
    if (!subdomain.ssl_enabled) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">SSL en attente</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Actif</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const variants = {
      'basic': 'bg-blue-100 text-blue-800',
      'pro': 'bg-purple-100 text-purple-800',
      'premium': 'bg-yellow-100 text-yellow-800',
      'enterprise': 'bg-red-100 text-red-800'
    };
    return variants[tier as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Sous-domaines</h2>
          <p className="text-muted-foreground">Gérez les sous-domaines des réparateurs avec plans payants</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchSubdomains} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un sous-domaine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau sous-domaine</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subdomain">Sous-domaine</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="subdomain"
                      value={newSubdomain.subdomain}
                      onChange={(e) => setNewSubdomain({...newSubdomain, subdomain: e.target.value})}
                      placeholder="mon-garage"
                      className="rounded-r-none"
                    />
                    <span className="border border-l-0 bg-muted px-3 py-2 text-sm rounded-r-md">
                      .votre-domaine.com
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="repairer">Réparateur</Label>
                  <Select value={newSubdomain.repairer_id} onValueChange={(value) => setNewSubdomain({...newSubdomain, repairer_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un réparateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {repairers.map((repairer) => (
                        <SelectItem key={repairer.id} value={repairer.id}>
                          {repairer.name} ({repairer.subscription_tier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                  <div>
                    <Label htmlFor="landing_page">Landing Page (optionnel)</Label>
                    <Select value={newSubdomain.landing_page_id} onValueChange={(value) => setNewSubdomain({...newSubdomain, landing_page_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une landing page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune (page par défaut)</SelectItem>
                        {landingPages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="custom_domain">Domaine personnalisé (optionnel)</Label>
                    <Input
                      id="custom_domain"
                      value={newSubdomain.custom_domain}
                      onChange={(e) => setNewSubdomain({...newSubdomain, custom_domain: e.target.value})}
                      placeholder="www.mon-garage.com"
                    />
                  </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  <Button onClick={createSubdomain} className="flex-1">
                    Créer le sous-domaine
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Sous-domaines</p>
                <p className="text-2xl font-bold text-foreground">{subdomains.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-foreground">
                  {subdomains.filter(s => s.is_active && s.dns_configured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Config. DNS</p>
                <p className="text-2xl font-bold text-foreground">
                  {subdomains.filter(s => !s.dns_configured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Inactifs</p>
                <p className="text-2xl font-bold text-foreground">
                  {subdomains.filter(s => !s.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des sous-domaines */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Sous-domaines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sous-domaine</TableHead>
                <TableHead>Réparateur</TableHead>
                <TableHead>Landing Page</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Domaine personnalisé</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : subdomains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun sous-domaine trouvé
                  </TableCell>
                </TableRow>
              ) : (
                subdomains.map((subdomain) => (
                  <TableRow key={subdomain.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {subdomain.subdomain}.votre-domaine.com
                      </div>
                    </TableCell>
                    <TableCell>{subdomain.repairer_name}</TableCell>
                    <TableCell>
                      {subdomain.landing_page_name ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {subdomain.landing_page_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Page par défaut</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierBadge(subdomain.subscription_tier || '')}>
                        {subdomain.subscription_tier}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(subdomain)}</TableCell>
                    <TableCell>
                      {subdomain.custom_domain ? (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {subdomain.custom_domain}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(subdomain.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://${subdomain.subdomain}.votre-domaine.com`, '_blank')}
                          title="Voir le site"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubdomainStatus(subdomain.id, subdomain.is_active)}
                          title={subdomain.is_active ? "Désactiver" : "Activer"}
                        >
                          {subdomain.is_active ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubdomain(subdomain.id)}
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
    </div>
  );
};

export default SubdomainsManagement;