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
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Euro, 
  Star, 
  Eye, 
  ShoppingCart,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calculator,
  FileText,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BuybackDevice {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deviceBrand: string;
  deviceModel: string;
  storage: string;
  color: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  batteryHealth: number;
  screenCondition: string;
  bodyCondition: string;
  functionalIssues: string[];
  accessories: string[];
  estimatedValue: number;
  finalOffer: number;
  status: 'evaluation' | 'offered' | 'accepted' | 'rejected' | 'paid' | 'resold';
  photos: string[];
  evaluationNotes: string;
  createdAt: string;
  evaluatedAt?: string;
  acceptedAt?: string;
}

const BuybackManager: React.FC = () => {
  const [buybackDevices, setBuybackDevices] = useState<BuybackDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BuybackDevice | null>(null);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadBuybackDevices();
  }, []);

  const loadBuybackDevices = () => {
    // Simulation de données
    const mockDevices: BuybackDevice[] = [
      {
        id: 'BUY001',
        clientName: 'Sophie Laurent',
        clientPhone: '06 11 22 33 44',
        clientEmail: 'sophie.laurent@email.com',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 12',
        storage: '128GB',
        color: 'Bleu',
        condition: 'good',
        batteryHealth: 87,
        screenCondition: 'Excellent',
        bodyCondition: 'Quelques rayures mineures',
        functionalIssues: [],
        accessories: ['Chargeur', 'Écouteurs'],
        estimatedValue: 420,
        finalOffer: 400,
        status: 'offered',
        photos: [],
        evaluationNotes: 'Bon état général, batterie correcte',
        createdAt: '2024-07-25',
        evaluatedAt: '2024-07-25'
      },
      {
        id: 'BUY002',
        clientName: 'Marc Dubois',
        clientPhone: '06 55 66 77 88',
        clientEmail: 'marc.dubois@email.com',
        deviceBrand: 'Samsung',
        deviceModel: 'Galaxy S21',
        storage: '256GB',
        color: 'Noir',
        condition: 'excellent',
        batteryHealth: 94,
        screenCondition: 'Parfait',
        bodyCondition: 'Comme neuf',
        functionalIssues: [],
        accessories: ['Chargeur', 'Écouteurs', 'Coque'],
        estimatedValue: 350,
        finalOffer: 0,
        status: 'evaluation',
        photos: [],
        evaluationNotes: '',
        createdAt: '2024-07-26'
      }
    ];
    setBuybackDevices(mockDevices);
  };

  const getStatusBadge = (status: BuybackDevice['status']) => {
    const statusConfig = {
      evaluation: { label: 'Évaluation', variant: 'outline' as const, color: 'text-blue-600' },
      offered: { label: 'Offre proposée', variant: 'outline' as const, color: 'text-yellow-600' },
      accepted: { label: 'Acceptée', variant: 'default' as const, color: 'text-green-600' },
      rejected: { label: 'Refusée', variant: 'outline' as const, color: 'text-red-600' },
      paid: { label: 'Payée', variant: 'default' as const, color: 'text-green-600' },
      resold: { label: 'Revendue', variant: 'outline' as const, color: 'text-purple-600' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getConditionBadge = (condition: BuybackDevice['condition']) => {
    const conditionConfig = {
      excellent: { label: 'Excellent', color: 'text-green-600', score: 100 },
      good: { label: 'Bon', color: 'text-blue-600', score: 80 },
      fair: { label: 'Moyen', color: 'text-yellow-600', score: 60 },
      poor: { label: 'Mauvais', color: 'text-red-600', score: 40 }
    };
    
    const config = conditionConfig[condition];
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={config.color}>
          {config.label}
        </Badge>
        <Progress value={config.score} className="w-16 h-2" />
      </div>
    );
  };

  const calculateDeviceValue = (device: BuybackDevice) => {
    let baseValue = 500; // Valeur de base selon le modèle
    
    // Ajustement selon l'état
    const conditionMultiplier = {
      excellent: 1.0,
      good: 0.85,
      fair: 0.65,
      poor: 0.40
    };
    
    baseValue *= conditionMultiplier[device.condition];
    
    // Ajustement selon la batterie
    if (device.batteryHealth < 80) baseValue *= 0.9;
    if (device.batteryHealth < 70) baseValue *= 0.8;
    
    // Bonus accessoires
    baseValue += device.accessories.length * 10;
    
    return Math.round(baseValue);
  };

  const updateDeviceStatus = (deviceId: string, newStatus: BuybackDevice['status'], offer?: number) => {
    setBuybackDevices(devices => 
      devices.map(device => 
        device.id === deviceId 
          ? { 
              ...device, 
              status: newStatus,
              finalOffer: offer || device.finalOffer,
              evaluatedAt: newStatus === 'offered' ? new Date().toISOString() : device.evaluatedAt,
              acceptedAt: newStatus === 'accepted' ? new Date().toISOString() : device.acceptedAt
            } 
          : device
      )
    );
    
    toast({
      title: "Statut mis à jour",
      description: `L'appareil ${deviceId} a été mis à jour`,
    });
  };

  const filteredDevices = buybackDevices.filter(device => {
    const matchesSearch = device.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Eye className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">En évaluation</p>
              <p className="text-2xl font-bold">{buybackDevices.filter(d => d.status === 'evaluation').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Offres en attente</p>
              <p className="text-2xl font-bold">{buybackDevices.filter(d => d.status === 'offered').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acceptées</p>
              <p className="text-2xl font-bold">{buybackDevices.filter(d => d.status === 'accepted').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Euro className="w-8 h-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valeur totale</p>
              <p className="text-2xl font-bold">
                {buybackDevices.reduce((sum, d) => sum + (d.finalOffer || d.estimatedValue), 0)}€
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestion des rachats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Rachat d'Appareils
            <Dialog open={isEvaluationDialogOpen} onOpenChange={setIsEvaluationDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Nouveau Rachat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouveau rachat d'appareil</DialogTitle>
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
                    <label className="text-sm font-medium">Marque</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Marque" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="samsung">Samsung</SelectItem>
                        <SelectItem value="huawei">Huawei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modèle</label>
                    <Input placeholder="iPhone 13, Galaxy S21..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stockage</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Capacité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="64gb">64GB</SelectItem>
                        <SelectItem value="128gb">128GB</SelectItem>
                        <SelectItem value="256gb">256GB</SelectItem>
                        <SelectItem value="512gb">512GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">État général</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Bon</SelectItem>
                        <SelectItem value="fair">Moyen</SelectItem>
                        <SelectItem value="poor">Mauvais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEvaluationDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => setIsEvaluationDialogOpen(false)}>
                    Commencer l'évaluation
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
                placeholder="Rechercher par nom, ID ou modèle..."
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
                <SelectItem value="evaluation">Évaluation</SelectItem>
                <SelectItem value="offered">Offre proposée</SelectItem>
                <SelectItem value="accepted">Acceptée</SelectItem>
                <SelectItem value="rejected">Refusée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="resold">Revendue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des rachats */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Appareil</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Valeur estimée</TableHead>
                <TableHead>Offre finale</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{device.clientName}</div>
                      <div className="text-sm text-muted-foreground">{device.clientPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{device.deviceBrand} {device.deviceModel}</div>
                      <div className="text-sm text-muted-foreground">{device.storage} - {device.color}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getConditionBadge(device.condition)}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 mr-1" />
                      {device.estimatedValue}€
                    </div>
                  </TableCell>
                  <TableCell>
                    {device.finalOffer > 0 ? (
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 mr-1" />
                        {device.finalOffer}€
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedDevice(device)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {device.status === 'evaluation' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateDeviceStatus(device.id, 'offered', calculateDeviceValue(device))}
                        >
                          <Calculator className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de détail d'un rachat */}
      {selectedDevice && (
        <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Rachat {selectedDevice.id} - {selectedDevice.deviceBrand} {selectedDevice.deviceModel}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="evaluation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="evaluation">Évaluation</TabsTrigger>
                <TabsTrigger value="offer">Offre</TabsTrigger>
                <TabsTrigger value="resale">Revente</TabsTrigger>
              </TabsList>
              
              <TabsContent value="evaluation" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">État de l'appareil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">État général</label>
                        {getConditionBadge(selectedDevice.condition)}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Santé de la batterie</label>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedDevice.batteryHealth} className="flex-1" />
                          <span className="text-sm">{selectedDevice.batteryHealth}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">État de l'écran</label>
                        <p className="text-sm">{selectedDevice.screenCondition}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">État du boîtier</label>
                        <p className="text-sm">{selectedDevice.bodyCondition}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Calcul de la valeur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Valeur de base:</span>
                        <span>500€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ajustement état:</span>
                        <span>-15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ajustement batterie:</span>
                        <span>-5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus accessoires:</span>
                        <span>+{selectedDevice.accessories.length * 10}€</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold">
                        <span>Valeur estimée:</span>
                        <span>{selectedDevice.estimatedValue}€</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="offer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Offre de rachat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Offre proposée</label>
                        <Input 
                          type="number" 
                          value={selectedDevice.finalOffer} 
                          placeholder="Montant en €"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Statut</label>
                        <Select 
                          value={selectedDevice.status}
                          onValueChange={(value) => updateDeviceStatus(selectedDevice.id, value as BuybackDevice['status'])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="evaluation">Évaluation</SelectItem>
                            <SelectItem value="offered">Offre proposée</SelectItem>
                            <SelectItem value="accepted">Acceptée</SelectItem>
                            <SelectItem value="rejected">Refusée</SelectItem>
                            <SelectItem value="paid">Payée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes d'évaluation</label>
                      <Textarea value={selectedDevice.evaluationNotes} placeholder="Notes sur l'évaluation..." />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resale" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Préparation pour la revente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Effacer données
                      </Button>
                      <Button variant="outline">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tests qualité
                      </Button>
                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Photos produit
                      </Button>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Prix de revente suggéré</label>
                      <Input type="number" placeholder="Prix en €" />
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

export default BuybackManager;