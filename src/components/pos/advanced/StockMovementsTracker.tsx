import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowRightLeft, 
  Edit3, 
  Plus, 
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface StockMovement {
  id: string;
  item_name: string;
  item_sku: string;
  movement_type: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'loss' | 'return';
  quantity: number;
  reason: string;
  location_from?: string;
  location_to?: string;
  employee_name: string;
  movement_date: string;
  reference_number?: string;
  notes?: string;
  unit_cost?: number;
  total_value?: number;
}

interface MovementSummary {
  total_entries: number;
  total_exits: number;
  total_transfers: number;
  total_adjustments: number;
  total_value_in: number;
  total_value_out: number;
  net_movement: number;
}

const StockMovementsTracker: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<MovementSummary>({
    total_entries: 0,
    total_exits: 0,
    total_transfers: 0,
    total_adjustments: 0,
    total_value_in: 0,
    total_value_out: 0,
    net_movement: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours
    to: new Date()
  });
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState({
    item_sku: '',
    adjustment_type: 'increase' as 'increase' | 'decrease',
    quantity: 1,
    reason: '',
    notes: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const loadMovements = async () => {
    // Mode démo avec données simulées
    if (user?.email === 'demo@demo.fr') {
      const mockMovements: StockMovement[] = [
        {
          id: '1',
          item_name: 'Écran iPhone 13',
          item_sku: 'SCR-IP13-001',
          movement_type: 'entry',
          quantity: 10,
          reason: 'Livraison fournisseur',
          location_to: 'Réserve Stock',
          employee_name: 'Marie Dubois',
          movement_date: new Date().toISOString(),
          reference_number: 'LIV-2025-001',
          unit_cost: 120.00,
          total_value: 1200.00
        },
        {
          id: '2',
          item_name: 'Batterie Samsung S21',
          item_sku: 'BAT-SS21-001',
          movement_type: 'exit',
          quantity: 2,
          reason: 'Vente client',
          location_from: 'Atelier Principal',
          employee_name: 'Pierre Martin',
          movement_date: new Date(Date.now() - 3600000).toISOString(),
          reference_number: 'VTE-2025-015',
          unit_cost: 65.00,
          total_value: 130.00
        },
        {
          id: '3',
          item_name: 'Vitre Protection',
          item_sku: 'VIT-PROT-001',
          movement_type: 'transfer',
          quantity: 5,
          reason: 'Réapprovisionnement vitrine',
          location_from: 'Réserve Stock',
          location_to: 'Vitrine Magasin',
          employee_name: 'Jean Dupont',
          movement_date: new Date(Date.now() - 7200000).toISOString(),
          unit_cost: 15.00,
          total_value: 75.00
        },
        {
          id: '4',
          item_name: 'Écran iPhone 12',
          item_sku: 'SCR-IP12-001',
          movement_type: 'adjustment',
          quantity: -2,
          reason: 'Inventaire - Écart constaté',
          location_from: 'Atelier Principal',
          employee_name: 'Marie Dubois',
          movement_date: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Écran cassé lors de la manipulation',
          unit_cost: 110.00,
          total_value: -220.00
        },
        {
          id: '5',
          item_name: 'Câble USB-C',
          item_sku: 'CAB-USBC-001',
          movement_type: 'loss',
          quantity: 1,
          reason: 'Produit défectueux',
          location_from: 'Vitrine Magasin',
          employee_name: 'Pierre Martin',
          movement_date: new Date(Date.now() - 172800000).toISOString(),
          reference_number: 'PERTE-2025-003',
          unit_cost: 8.50,
          total_value: -8.50
        }
      ];

      setMovements(mockMovements);
      
      // Calculer le résumé
      const summaryData = mockMovements.reduce((acc, movement) => {
        switch (movement.movement_type) {
          case 'entry':
            acc.total_entries += movement.quantity;
            acc.total_value_in += movement.total_value || 0;
            break;
          case 'exit':
            acc.total_exits += movement.quantity;
            acc.total_value_out += movement.total_value || 0;
            break;
          case 'transfer':
            acc.total_transfers += movement.quantity;
            break;
          case 'adjustment':
            acc.total_adjustments += Math.abs(movement.quantity);
            if (movement.quantity > 0) {
              acc.total_value_in += movement.total_value || 0;
            } else {
              acc.total_value_out += Math.abs(movement.total_value || 0);
            }
            break;
        }
        return acc;
      }, {
        total_entries: 0,
        total_exits: 0,
        total_transfers: 0,
        total_adjustments: 0,
        total_value_in: 0,
        total_value_out: 0,
        net_movement: 0
      });

      summaryData.net_movement = summaryData.total_value_in - summaryData.total_value_out;
      setSummary(summaryData);
    }
  };

  const createAdjustment = async () => {
    if (!newAdjustment.item_sku || !newAdjustment.reason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const adjustment: StockMovement = {
      id: Date.now().toString(),
      item_name: `Produit ${newAdjustment.item_sku}`,
      item_sku: newAdjustment.item_sku,
      movement_type: 'adjustment',
      quantity: newAdjustment.adjustment_type === 'increase' ? newAdjustment.quantity : -newAdjustment.quantity,
      reason: newAdjustment.reason,
      employee_name: 'Utilisateur Actuel',
      movement_date: new Date().toISOString(),
      notes: newAdjustment.notes,
      reference_number: `ADJ-${Date.now().toString().slice(-6)}`,
      unit_cost: 0,
      total_value: 0
    };

    setMovements(prev => [adjustment, ...prev]);
    setNewAdjustment({ item_sku: '', adjustment_type: 'increase', quantity: 1, reason: '', notes: '' });
    setIsAdjustmentDialogOpen(false);

    toast({
      title: "Ajustement créé",
      description: `Ajustement de stock enregistré: ${adjustment.quantity > 0 ? '+' : ''}${adjustment.quantity} ${adjustment.item_sku}`,
      duration: 3000
    });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entry': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'exit': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'transfer': return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
      case 'adjustment': return <Edit3 className="w-4 h-4 text-orange-600" />;
      case 'loss': return <AlertCircle className="w-4 h-4 text-red-800" />;
      case 'return': return <ArrowUp className="w-4 h-4 text-purple-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    const configs = {
      entry: { label: 'Entrée', variant: 'default' as const, className: 'bg-green-600' },
      exit: { label: 'Sortie', variant: 'default' as const, className: 'bg-red-600' },
      transfer: { label: 'Transfert', variant: 'default' as const, className: 'bg-blue-600' },
      adjustment: { label: 'Ajustement', variant: 'default' as const, className: 'bg-orange-600' },
      loss: { label: 'Perte', variant: 'destructive' as const, className: '' },
      return: { label: 'Retour', variant: 'default' as const, className: 'bg-purple-600' }
    };
    
    const config = configs[type as keyof typeof configs] || { label: type, variant: 'outline' as const, className: '' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const applyFilters = () => {
    let filtered = movements;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.item_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(movement => movement.movement_type === selectedType);
    }

    // Filtre par date
    filtered = filtered.filter(movement => {
      const movementDate = new Date(movement.movement_date);
      return movementDate >= dateRange.from && movementDate <= dateRange.to;
    });

    setFilteredMovements(filtered);
  };

  useEffect(() => {
    loadMovements();
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
  }, [movements, searchTerm, selectedType, selectedLocation, dateRange]);

  return (
    <div className="space-y-6">
      {/* Résumé des mouvements */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Entrées</p>
                <p className="text-2xl font-bold text-green-900">{summary.total_entries}</p>
                <p className="text-xs text-green-600">{summary.total_value_in.toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Sorties</p>
                <p className="text-2xl font-bold text-red-900">{summary.total_exits}</p>
                <p className="text-xs text-red-600">{summary.total_value_out.toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Transferts</p>
                <p className="text-2xl font-bold text-blue-900">{summary.total_transfers}</p>
                <p className="text-xs text-blue-600">Mouvements internes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Edit3 className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700">Valeur Nette</p>
                <p className={`text-2xl font-bold ${summary.net_movement >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {summary.net_movement >= 0 ? '+' : ''}{summary.net_movement.toFixed(2)}€
                </p>
                <p className="text-xs text-orange-600">{summary.total_adjustments} ajustements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et contrôles */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Journal des Mouvements de Stock
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajustement Stock
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un Ajustement de Stock</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="item_sku">SKU du produit</Label>
                      <Input
                        id="item_sku"
                        value={newAdjustment.item_sku}
                        onChange={(e) => setNewAdjustment(prev => ({ ...prev, item_sku: e.target.value }))}
                        placeholder="Ex: SCR-IP13-001"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adjustment_type">Type d'ajustement</Label>
                        <Select 
                          value={newAdjustment.adjustment_type} 
                          onValueChange={(value: 'increase' | 'decrease') => setNewAdjustment(prev => ({ ...prev, adjustment_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="increase">Augmentation</SelectItem>
                            <SelectItem value="decrease">Diminution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantité</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newAdjustment.quantity}
                          onChange={(e) => setNewAdjustment(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Raison de l'ajustement</Label>
                      <Select 
                        value={newAdjustment.reason} 
                        onValueChange={(value) => setNewAdjustment(prev => ({ ...prev, reason: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une raison..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inventaire - Écart constaté">Inventaire - Écart constaté</SelectItem>
                          <SelectItem value="Produit défectueux">Produit défectueux</SelectItem>
                          <SelectItem value="Casse accidentelle">Casse accidentelle</SelectItem>
                          <SelectItem value="Vol/Perte">Vol/Perte</SelectItem>
                          <SelectItem value="Retour fournisseur">Retour fournisseur</SelectItem>
                          <SelectItem value="Erreur de saisie">Erreur de saisie</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes complémentaires</Label>
                      <Textarea
                        id="notes"
                        value={newAdjustment.notes}
                        onChange={(e) => setNewAdjustment(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Détails de l'ajustement..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={createAdjustment}>
                      Créer l'Ajustement
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par produit, SKU ou raison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type de mouvement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="entry">Entrées</SelectItem>
                <SelectItem value="exit">Sorties</SelectItem>
                <SelectItem value="transfer">Transferts</SelectItem>
                <SelectItem value="adjustment">Ajustements</SelectItem>
                <SelectItem value="loss">Pertes</SelectItem>
                <SelectItem value="return">Retours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table des mouvements */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valeur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.movement_type)}
                        {getMovementTypeBadge(movement.movement_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{movement.item_name}</div>
                        <div className="text-sm text-muted-foreground">{movement.item_sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {movement.location_from && (
                          <div className="text-muted-foreground">De: {movement.location_from}</div>
                        )}
                        {movement.location_to && (
                          <div className="text-muted-foreground">Vers: {movement.location_to}</div>
                        )}
                        {!movement.location_from && !movement.location_to && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={movement.reason}>
                        {movement.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{movement.employee_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(movement.movement_date).toLocaleDateString('fr-FR')}
                        <div className="text-xs text-muted-foreground">
                          {new Date(movement.movement_date).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${(movement.total_value || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(movement.total_value || 0) >= 0 ? '+' : ''}{(movement.total_value || 0).toFixed(2)}€
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovementsTracker;