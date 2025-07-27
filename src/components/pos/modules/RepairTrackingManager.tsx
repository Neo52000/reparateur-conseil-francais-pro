import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Phone, 
  Mail,
  Package,
  Calendar,
  FileText,
  Camera,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RepairOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  device: string;
  model: string;
  issue: string;
  status: 'received' | 'diagnosis' | 'waiting_parts' | 'in_progress' | 'completed' | 'delivered';
  estimatedCompletion: string;
  totalCost: number;
  depositPaid: number;
  createdAt: string;
  notes: string;
  photos: string[];
}

const RepairTrackingManager: React.FC = () => {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadRepairOrders();
  }, []);

  const loadRepairOrders = () => {
    // Simulation de données
    const mockOrders: RepairOrder[] = [
      {
        id: 'REP001',
        clientName: 'Marie Dubois',
        clientPhone: '06 12 34 56 78',
        clientEmail: 'marie.dubois@email.com',
        device: 'iPhone',
        model: 'iPhone 13',
        issue: 'Écran cassé',
        status: 'in_progress',
        estimatedCompletion: '2024-07-30',
        totalCost: 149.90,
        depositPaid: 50.00,
        createdAt: '2024-07-25',
        notes: 'Écran très endommagé, tactile non fonctionnel',
        photos: []
      },
      {
        id: 'REP002',
        clientName: 'Pierre Martin',
        clientPhone: '06 98 76 54 32',
        clientEmail: 'pierre.martin@email.com',
        device: 'Samsung Galaxy',
        model: 'S21',
        issue: 'Batterie défaillante',
        status: 'diagnosis',
        estimatedCompletion: '2024-07-28',
        totalCost: 89.90,
        depositPaid: 30.00,
        createdAt: '2024-07-26',
        notes: 'Batterie se décharge très rapidement',
        photos: []
      }
    ];
    setRepairOrders(mockOrders);
  };

  const getStatusBadge = (status: RepairOrder['status']) => {
    const statusConfig = {
      received: { label: 'Reçu', variant: 'outline' as const, color: 'text-blue-600' },
      diagnosis: { label: 'Diagnostic', variant: 'outline' as const, color: 'text-yellow-600' },
      waiting_parts: { label: 'Attente pièces', variant: 'outline' as const, color: 'text-orange-600' },
      in_progress: { label: 'En cours', variant: 'default' as const, color: 'text-blue-600' },
      completed: { label: 'Terminé', variant: 'outline' as const, color: 'text-green-600' },
      delivered: { label: 'Livré', variant: 'default' as const, color: 'text-green-600' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: RepairOrder['status']) => {
    setRepairOrders(orders => 
      orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    toast({
      title: "Statut mis à jour",
      description: `La commande ${orderId} a été mise à jour`,
    });
  };

  const sendStatusUpdate = (order: RepairOrder) => {
    toast({
      title: "Notification envoyée",
      description: `SMS/Email envoyé à ${order.clientName}`,
    });
  };

  const filteredOrders = repairOrders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.device.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Wrench className="w-8 h-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">En cours</p>
              <p className="text-2xl font-bold">{repairOrders.filter(o => o.status === 'in_progress').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold">{repairOrders.filter(o => o.status === 'waiting_parts').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Terminés</p>
              <p className="text-2xl font-bold">{repairOrders.filter(o => o.status === 'completed').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Retard</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gestion des Réparations
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Nouvelle Réparation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle réparation</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom du client</label>
                    <Input placeholder="Nom complet" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input placeholder="06 12 34 56 78" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="client@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Appareil</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Type d'appareil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iphone">iPhone</SelectItem>
                        <SelectItem value="samsung">Samsung</SelectItem>
                        <SelectItem value="huawei">Huawei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Problème décrit</label>
                    <Textarea placeholder="Description du problème..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Créer la réparation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, ID ou appareil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="received">Reçu</SelectItem>
                <SelectItem value="diagnosis">Diagnostic</SelectItem>
                <SelectItem value="waiting_parts">Attente pièces</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des réparations */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Appareil</TableHead>
                <TableHead>Problème</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Coût</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.clientName}</div>
                      <div className="text-sm text-muted-foreground">{order.clientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.device}</div>
                      <div className="text-sm text-muted-foreground">{order.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>{order.issue}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.estimatedCompletion}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.totalCost}€</div>
                      <div className="text-sm text-muted-foreground">Acompte: {order.depositPaid}€</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendStatusUpdate(order)}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de détail d'une réparation */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Réparation {selectedOrder.id} - {selectedOrder.clientName}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="progress">Progression</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Informations Client
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{selectedOrder.clientName}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{selectedOrder.clientPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{selectedOrder.clientEmail}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Appareil
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Marque:</strong> {selectedOrder.device}</div>
                      <div><strong>Modèle:</strong> {selectedOrder.model}</div>
                      <div><strong>Problème:</strong> {selectedOrder.issue}</div>
                      <div><strong>Notes:</strong> {selectedOrder.notes}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Changer le statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select 
                      value={selectedOrder.status} 
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as RepairOrder['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Reçu</SelectItem>
                        <SelectItem value="diagnosis">Diagnostic</SelectItem>
                        <SelectItem value="waiting_parts">Attente pièces</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                        <SelectItem value="delivered">Livré</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="communication" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Envoyer une mise à jour</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder="Message personnalisé pour le client..." />
                    <div className="flex gap-2">
                      <Button onClick={() => sendStatusUpdate(selectedOrder)}>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer SMS
                      </Button>
                      <Button variant="outline" onClick={() => sendStatusUpdate(selectedOrder)}>
                        <Mail className="w-4 h-4 mr-2" />
                        Envoyer Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RepairTrackingManager;