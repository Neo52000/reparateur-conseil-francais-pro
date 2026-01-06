import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  MapPin, 
  Plus, 
  Trash2, 
  User, 
  Search,
  Euro,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import ExclusivityZoneMap from './ExclusivityZoneMap';

interface ExclusivityZone {
  id: string;
  city_slug: string;
  city_name: string;
  postal_codes: string[];
  radius_km: number;
  monthly_price: number;
  yearly_price?: number | null;
  is_active: boolean;
  repairer_id: string | null;
  starts_at: string | null;
  ends_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at?: string;
}

interface Repairer {
  id: string;
  name: string;
  email: string;
  city: string;
  repairer_level: number;
}

const ExclusivityZonesAdmin: React.FC = () => {
  const [zones, setZones] = useState<ExclusivityZone[]>([]);
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'assigned'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ExclusivityZone | null>(null);
  const [selectedRepairerId, setSelectedRepairerId] = useState<string>('');
  const [newZone, setNewZone] = useState({
    city_name: '',
    city_slug: '',
    postal_codes: '',
    radius_km: 15,
    monthly_price: 299,
    yearly_price: 2990
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('exclusivity_zones')
        .select('*')
        .order('city_name');

      if (zonesError) throw zonesError;
      // Cast to our interface
      const mappedZones: ExclusivityZone[] = (zonesData || []).map((z: any) => ({
        id: z.id,
        city_slug: z.city_slug,
        city_name: z.city_name,
        postal_codes: z.postal_codes || [],
        radius_km: z.radius_km,
        monthly_price: z.monthly_price,
        yearly_price: null,
        is_active: z.is_active,
        repairer_id: z.repairer_id,
        starts_at: z.starts_at,
        ends_at: null,
        expires_at: z.expires_at,
        created_at: z.created_at,
        updated_at: z.updated_at
      }));
      setZones(mappedZones);

      // Charger les réparateurs premium/enterprise
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairer_profiles')
        .select('id, user_id, business_name, city, repairer_level');

      if (repairersError) throw repairersError;

      // Filtrer et mapper les réparateurs
      const repairersList: Repairer[] = (repairersData || [])
        .filter((r: any) => r.repairer_level >= 1 && r.repairer_level < 3)
        .map((r: any) => ({
          id: r.id,
          name: r.business_name || 'Sans nom',
          email: '',
          city: r.city || '',
          repairer_level: r.repairer_level || 0
        }));
      
      setRepairers(repairersList);

    } catch (error) {
      console.error('Erreur chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createZone = async () => {
    try {
      const slug = newZone.city_slug || newZone.city_name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('exclusivity_zones')
        .insert({
          city_name: newZone.city_name,
          city_slug: slug,
          postal_codes: newZone.postal_codes.split(',').map(p => p.trim()),
          radius_km: newZone.radius_km,
          monthly_price: newZone.monthly_price,
          yearly_price: newZone.yearly_price,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Zone créée",
        description: `Zone exclusive ${newZone.city_name} créée avec succès`
      });

      setIsCreateOpen(false);
      setNewZone({
        city_name: '',
        city_slug: '',
        postal_codes: '',
        radius_km: 15,
        monthly_price: 299,
        yearly_price: 2990
      });
      loadData();

    } catch (error) {
      console.error('Erreur création:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la zone",
        variant: "destructive"
      });
    }
  };

  const assignZone = async () => {
    if (!selectedZone || !selectedRepairerId) return;

    try {
      // Mettre à jour la zone
      const { error: zoneError } = await supabase
        .from('exclusivity_zones')
        .update({
          repairer_id: selectedRepairerId,
          starts_at: new Date().toISOString()
        })
        .eq('id', selectedZone.id);

      if (zoneError) throw zoneError;

      // Mettre à jour le niveau du réparateur
      const { error: repairerError } = await supabase
        .from('repairer_profiles')
        .update({
          repairer_level: 3,
          exclusivity_zone_id: selectedZone.id
        })
        .eq('id', selectedRepairerId);

      if (repairerError) throw repairerError;

      toast({
        title: "Zone assignée",
        description: `Le réparateur est maintenant Partenaire Exclusif sur ${selectedZone.city_name}`
      });

      setIsAssignOpen(false);
      setSelectedZone(null);
      setSelectedRepairerId('');
      loadData();

    } catch (error) {
      console.error('Erreur assignation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner la zone",
        variant: "destructive"
      });
    }
  };

  const releaseZone = async (zone: ExclusivityZone) => {
    if (!zone.repairer_id) return;

    try {
      // Libérer la zone
      const { error: zoneError } = await supabase
        .from('exclusivity_zones')
        .update({
          repairer_id: null,
          starts_at: null,
          ends_at: new Date().toISOString()
        })
        .eq('id', zone.id);

      if (zoneError) throw zoneError;

      // Rétrograder le réparateur
      const { error: repairerError } = await supabase
        .from('repairer_profiles')
        .update({
          repairer_level: 2,
          exclusivity_zone_id: null
        })
        .eq('id', zone.repairer_id);

      if (repairerError) throw repairerError;

      toast({
        title: "Zone libérée",
        description: `La zone ${zone.city_name} est de nouveau disponible`
      });

      loadData();

    } catch (error) {
      console.error('Erreur libération:', error);
      toast({
        title: "Erreur",
        description: "Impossible de libérer la zone",
        variant: "destructive"
      });
    }
  };

  const deleteZone = async (zoneId: string) => {
    try {
      const { error } = await supabase
        .from('exclusivity_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      toast({
        title: "Zone supprimée",
        description: "La zone a été supprimée"
      });

      loadData();

    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la zone",
        variant: "destructive"
      });
    }
  };

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.city_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          zone.postal_codes.some(p => p.includes(searchTerm));
    
    if (statusFilter === 'available') return matchesSearch && !zone.repairer_id;
    if (statusFilter === 'assigned') return matchesSearch && zone.repairer_id;
    return matchesSearch;
  });

  const stats = {
    total: zones.length,
    available: zones.filter(z => !z.repairer_id).length,
    assigned: zones.filter(z => z.repairer_id).length,
    revenue: zones.filter(z => z.repairer_id).reduce((sum, z) => sum + z.monthly_price, 0)
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Zones d'Exclusivité N3
          </h2>
          <p className="text-muted-foreground">
            Gérez les zones d'exclusivité pour les partenaires Premium
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Créer une zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une zone d'exclusivité</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la ville</Label>
                <Input
                  value={newZone.city_name}
                  onChange={(e) => setNewZone({ ...newZone, city_name: e.target.value })}
                  placeholder="Ex: Paris"
                />
              </div>
              <div className="space-y-2">
                <Label>Codes postaux (séparés par virgules)</Label>
                <Input
                  value={newZone.postal_codes}
                  onChange={(e) => setNewZone({ ...newZone, postal_codes: e.target.value })}
                  placeholder="75001, 75002, 75003"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rayon (km)</Label>
                  <Input
                    type="number"
                    value={newZone.radius_km}
                    onChange={(e) => setNewZone({ ...newZone, radius_km: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix mensuel (€)</Label>
                  <Input
                    type="number"
                    value={newZone.monthly_price}
                    onChange={(e) => setNewZone({ ...newZone, monthly_price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Prix annuel (€)</Label>
                <Input
                  type="number"
                  value={newZone.yearly_price}
                  onChange={(e) => setNewZone({ ...newZone, yearly_price: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={createZone} className="bg-amber-600 hover:bg-amber-700">
                Créer la zone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total zones</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Assignées</p>
                <p className="text-2xl font-bold">{stats.assigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Euro className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenu mensuel</p>
                <p className="text-2xl font-bold">{stats.revenue}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte des zones */}
      <Card>
        <CardHeader>
          <CardTitle>Carte des zones</CardTitle>
          <CardDescription>Visualisez les zones d'exclusivité sur la carte</CardDescription>
        </CardHeader>
        <CardContent>
          <ExclusivityZoneMap zones={zones} />
        </CardContent>
      </Card>

      {/* Liste des zones */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des zones</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ville ou code postal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="assigned">Assignées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ville</TableHead>
                <TableHead>Codes postaux</TableHead>
                <TableHead>Rayon</TableHead>
                <TableHead>Prix/mois</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Partenaire</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredZones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Aucune zone trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredZones.map((zone) => {
                  const assignedRepairer = repairers.find(r => r.id === zone.repairer_id);
                  
                  return (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {zone.city_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {zone.postal_codes.slice(0, 3).map((code, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                          {zone.postal_codes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{zone.postal_codes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{zone.radius_km} km</TableCell>
                      <TableCell>{zone.monthly_price}€</TableCell>
                      <TableCell>
                        {zone.repairer_id ? (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Assignée
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Disponible
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignedRepairer ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm">{assignedRepairer.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!zone.repairer_id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedZone(zone);
                                setIsAssignOpen(true);
                              }}
                            >
                              <User className="w-4 h-4 mr-1" />
                              Assigner
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => releaseZone(zone)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Libérer
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteZone(zone.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'assignation */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner la zone {selectedZone?.city_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez un réparateur Premium ou Enterprise pour l'exclusivité sur cette zone.
            </p>
            <Select value={selectedRepairerId} onValueChange={setSelectedRepairerId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un réparateur" />
              </SelectTrigger>
              <SelectContent>
                {repairers.filter(r => r.repairer_level < 3).map((repairer) => (
                  <SelectItem key={repairer.id} value={repairer.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {repairer.name} - {repairer.city}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={assignZone} 
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!selectedRepairerId}
            >
              <Crown className="w-4 h-4 mr-2" />
              Assigner l'exclusivité
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExclusivityZonesAdmin;
