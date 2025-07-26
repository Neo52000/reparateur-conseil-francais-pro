import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Warehouse, 
  Package, 
  ArrowRightLeft, 
  Plus, 
  MapPin, 
  QrCode, 
  BarChart3,
  Edit,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface StockLocation {
  id: string;
  name: string;
  code: string;
  type: 'atelier' | 'vitrine' | 'reserve' | 'other';
  description?: string;
  capacity: number;
  current_items: number;
  qr_code?: string;
}

interface StockItem {
  id: string;
  name: string;
  sku: string;
  total_stock: number;
  locations: Array<{
    location_id: string;
    location_name: string;
    location_code: string;
    quantity: number;
  }>;
}

interface StockTransfer {
  id: string;
  item_name: string;
  item_sku: string;
  from_location: string;
  to_location: string;
  quantity: number;
  transfer_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

const MultiDepotManager: React.FC = () => {
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    code: '',
    type: 'atelier' as const,
    description: '',
    capacity: 100
  });
  const [newTransfer, setNewTransfer] = useState({
    item_id: '',
    from_location: '',
    to_location: '',
    quantity: 1,
    notes: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const loadLocations = async () => {
    // Mode démo avec données simulées
    if (user?.email === 'demo@demo.fr') {
      setLocations([
        {
          id: '1',
          name: 'Atelier Principal',
          code: 'ATL-01',
          type: 'atelier',
          description: 'Zone de réparation principale',
          capacity: 200,
          current_items: 145,
          qr_code: 'QR-ATL-01'
        },
        {
          id: '2',
          name: 'Vitrine Magasin',
          code: 'VIT-01',
          type: 'vitrine',
          description: 'Exposition produits clients',
          capacity: 50,
          current_items: 32,
          qr_code: 'QR-VIT-01'
        },
        {
          id: '3',
          name: 'Réserve Stock',
          code: 'RSV-01',
          type: 'reserve',
          description: 'Stockage long terme',
          capacity: 500,
          current_items: 280,
          qr_code: 'QR-RSV-01'
        }
      ]);

      setStockItems([
        {
          id: '1',
          name: 'Écran iPhone 13',
          sku: 'SCR-IP13-001',
          total_stock: 15,
          locations: [
            { location_id: '1', location_name: 'Atelier Principal', location_code: 'ATL-01', quantity: 8 },
            { location_id: '2', location_name: 'Vitrine Magasin', location_code: 'VIT-01', quantity: 2 },
            { location_id: '3', location_name: 'Réserve Stock', location_code: 'RSV-01', quantity: 5 }
          ]
        },
        {
          id: '2',
          name: 'Batterie Samsung S21',
          sku: 'BAT-SS21-001',
          total_stock: 12,
          locations: [
            { location_id: '1', location_name: 'Atelier Principal', location_code: 'ATL-01', quantity: 7 },
            { location_id: '3', location_name: 'Réserve Stock', location_code: 'RSV-01', quantity: 5 }
          ]
        }
      ]);

      setTransfers([
        {
          id: '1',
          item_name: 'Écran iPhone 13',
          item_sku: 'SCR-IP13-001',
          from_location: 'Réserve Stock',
          to_location: 'Atelier Principal',
          quantity: 3,
          transfer_date: new Date().toISOString(),
          status: 'completed',
          notes: 'Réapprovisionnement atelier'
        },
        {
          id: '2',
          item_name: 'Batterie Samsung S21',
          item_sku: 'BAT-SS21-001',
          from_location: 'Atelier Principal',
          to_location: 'Vitrine Magasin',
          quantity: 2,
          transfer_date: new Date().toISOString(),
          status: 'pending',
          notes: 'Exposition client'
        }
      ]);
    }
  };

  const createLocation = async () => {
    if (!newLocation.name || !newLocation.code) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const location: StockLocation = {
      id: Date.now().toString(),
      ...newLocation,
      current_items: 0,
      qr_code: `QR-${newLocation.code}`
    };

    setLocations(prev => [...prev, location]);
    setNewLocation({ name: '', code: '', type: 'atelier', description: '', capacity: 100 });
    setIsLocationDialogOpen(false);

    toast({
      title: "Emplacement créé",
      description: `${location.name} (${location.code}) ajouté avec succès`,
      duration: 3000
    });
  };

  const createTransfer = async () => {
    if (!newTransfer.item_id || !newTransfer.from_location || !newTransfer.to_location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedItem = stockItems.find(item => item.id === newTransfer.item_id);
    if (!selectedItem) return;

    const transfer: StockTransfer = {
      id: Date.now().toString(),
      item_name: selectedItem.name,
      item_sku: selectedItem.sku,
      from_location: locations.find(l => l.id === newTransfer.from_location)?.name || '',
      to_location: locations.find(l => l.id === newTransfer.to_location)?.name || '',
      quantity: newTransfer.quantity,
      transfer_date: new Date().toISOString(),
      status: 'pending',
      notes: newTransfer.notes
    };

    setTransfers(prev => [transfer, ...prev]);
    setNewTransfer({ item_id: '', from_location: '', to_location: '', quantity: 1, notes: '' });
    setIsTransferDialogOpen(false);

    toast({
      title: "Transfert créé",
      description: `Transfert de ${transfer.quantity} ${transfer.item_name} programmé`,
      duration: 3000
    });
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'atelier': return 'bg-blue-100 text-blue-800';
      case 'vitrine': return 'bg-green-100 text-green-800';
      case 'reserve': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'atelier': return <Package className="w-4 h-4" />;
      case 'vitrine': return <Eye className="w-4 h-4" />;
      case 'reserve': return <Warehouse className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Terminé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const filteredStockItems = selectedLocation === 'all' 
    ? stockItems 
    : stockItems.filter(item => 
        item.locations.some(loc => loc.location_id === selectedLocation)
      );

  useEffect(() => {
    loadLocations();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques des emplacements */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {locations.map((location) => (
          <Card key={location.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getLocationTypeIcon(location.type)}
                  <span className="font-medium text-sm">{location.name}</span>
                </div>
                <Badge className={getLocationTypeColor(location.type)}>
                  {location.type}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-mono">{location.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupation:</span>
                  <span className="font-medium">
                    {location.current_items}/{location.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(location.current_items / location.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions et filtres */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="w-5 h-5" />
              Gestion Multi-Dépôts
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel Emplacement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un Nouvel Emplacement</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de l'emplacement</Label>
                      <Input
                        id="name"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Atelier Principal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={newLocation.code}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="Ex: ATL-01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={newLocation.type} onValueChange={(value: any) => setNewLocation(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="atelier">Atelier</SelectItem>
                          <SelectItem value="vitrine">Vitrine</SelectItem>
                          <SelectItem value="reserve">Réserve</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacité</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={newLocation.capacity}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                        placeholder="100"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newLocation.description}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description de l'emplacement..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={createLocation}>
                      Créer l'Emplacement
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Nouveau Transfert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un Transfert de Stock</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="item">Produit à transférer</Label>
                      <Select value={newTransfer.item_id} onValueChange={(value) => setNewTransfer(prev => ({ ...prev, item_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {stockItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from">De l'emplacement</Label>
                        <Select value={newTransfer.from_location} onValueChange={(value) => setNewTransfer(prev => ({ ...prev, from_location: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Origine..." />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name} ({location.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="to">Vers l'emplacement</Label>
                        <Select value={newTransfer.to_location} onValueChange={(value) => setNewTransfer(prev => ({ ...prev, to_location: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Destination..." />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.filter(l => l.id !== newTransfer.from_location).map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name} ({location.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantité</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newTransfer.quantity}
                        onChange={(e) => setNewTransfer(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optionnel)</Label>
                      <Input
                        id="notes"
                        value={newTransfer.notes}
                        onChange={(e) => setNewTransfer(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Raison du transfert..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={createTransfer}>
                      Créer le Transfert
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="location-filter">Filtrer par emplacement</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les emplacements</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table de distribution des stocks */}
          <div className="border rounded-lg mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Stock Total</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">
                        {item.total_stock} unités
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {item.locations.map((loc) => (
                          <div key={loc.location_id} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                              {loc.location_code}
                            </Badge>
                            <span className="font-medium">{loc.quantity}</span>
                            <span className="text-muted-foreground">dans {loc.location_name}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ArrowRightLeft className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Historique des transferts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Transferts Récents
            </h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>De → Vers</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transfer.item_name}</div>
                          <div className="text-sm text-muted-foreground">{transfer.item_sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{transfer.from_location}</Badge>
                          <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="outline">{transfer.to_location}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{transfer.quantity}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(transfer.transfer_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transfer.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiDepotManager;