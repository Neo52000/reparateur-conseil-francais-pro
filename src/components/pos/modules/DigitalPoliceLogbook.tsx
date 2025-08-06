import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  FileText,
  Download,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  Printer,
  Upload,
  Eye,
  Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PoliceLogEntry {
  id: string;
  entryNumber: string;
  date: string;
  time: string;
  
  // Informations vendeur
  sellerName: string;
  sellerIdType: string;
  sellerIdNumber: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail?: string;
  sellerIdPhoto?: string;
  
  // Informations objet
  itemType: 'smartphone' | 'tablette' | 'ordinateur' | 'montre' | 'autre';
  brand: string;
  model: string;
  imei?: string;
  serialNumber?: string;
  color: string;
  description: string;
  condition: string;
  
  // Informations commerciales
  purchasePrice: number;
  estimatedValue: number;
  
  // Documentation
  photos: string[];
  notes: string;
  
  // Traçabilité
  createdBy: string;
  verifiedBy?: string;
  status: 'active' | 'sold' | 'destroyed' | 'returned';
  soldDate?: string;
  soldTo?: string;
  soldPrice?: number;
  
  // Conformité
  declarationSent: boolean;
  declarationDate?: string;
  isDigitalEntry: boolean;
}

interface DigitalPoliceLogbookProps {
  repairerId: string;
  hasAccess: boolean;
}

const DigitalPoliceLogbook: React.FC<DigitalPoliceLogbookProps> = ({
  repairerId,
  hasAccess
}) => {
  const [entries, setEntries] = useState<PoliceLogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PoliceLogEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (hasAccess) {
      loadPoliceLogEntries();
    }
  }, [hasAccess]);

  const loadPoliceLogEntries = () => {
    // Simulation de données
    const mockEntries: PoliceLogEntry[] = [
      {
        id: 'POL001',
        entryNumber: 'LP-2024-001',
        date: '2024-07-26',
        time: '14:30',
        sellerName: 'Sophie Laurent',
        sellerIdType: 'Carte nationale d\'identité',
        sellerIdNumber: '1234567890123',
        sellerAddress: '123 Rue de la Paix, 75001 Paris',
        sellerPhone: '06 11 22 33 44',
        sellerEmail: 'sophie.laurent@email.com',
        itemType: 'smartphone',
        brand: 'Apple',
        model: 'iPhone 12',
        imei: '123456789012345',
        color: 'Bleu',
        description: 'iPhone 12 128GB en bon état',
        condition: 'Bon état général, quelques rayures mineures',
        purchasePrice: 400,
        estimatedValue: 420,
        photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
        notes: 'Appareil testé, fonctionnel',
        createdBy: 'Jean Réparateur',
        status: 'active',
        declarationSent: true,
        declarationDate: '2024-07-26',
        isDigitalEntry: true
      },
      {
        id: 'POL002',
        entryNumber: 'LP-2024-002',
        date: '2024-07-25',
        time: '10:15',
        sellerName: 'Marc Dubois',
        sellerIdType: 'Passeport',
        sellerIdNumber: 'AB1234567',
        sellerAddress: '456 Avenue Victor Hugo, 75016 Paris',
        sellerPhone: '06 55 66 77 88',
        itemType: 'smartphone',
        brand: 'Samsung',
        model: 'Galaxy S21',
        imei: '987654321098765',
        color: 'Noir',
        description: 'Samsung Galaxy S21 256GB excellent état',
        condition: 'Excellent état, comme neuf',
        purchasePrice: 350,
        estimatedValue: 380,
        photos: ['photo4.jpg', 'photo5.jpg'],
        notes: 'Appareil avec boîte et accessoires',
        createdBy: 'Jean Réparateur',
        status: 'sold',
        soldDate: '2024-07-26',
        soldTo: 'Client particulier',
        soldPrice: 450,
        declarationSent: true,
        declarationDate: '2024-07-25',
        isDigitalEntry: true
      }
    ];
    setEntries(mockEntries);
  };

  const getStatusBadge = (status: PoliceLogEntry['status']) => {
    const statusConfig = {
      active: { label: 'En stock', variant: 'default' as const, color: 'text-blue-600' },
      sold: { label: 'Vendu', variant: 'default' as const, color: 'text-green-600' },
      destroyed: { label: 'Détruit', variant: 'outline' as const, color: 'text-red-600' },
      returned: { label: 'Restitué', variant: 'outline' as const, color: 'text-yellow-600' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.imei && entry.imei.includes(searchTerm));
    
    const matchesDate = !dateFilter || entry.date === dateFilter;
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const generateDeclarationReport = () => {
    const undeclaredEntries = entries.filter(entry => !entry.declarationSent);
    
    if (undeclaredEntries.length === 0) {
      toast({
        title: "Aucune déclaration en attente",
        description: "Toutes les entrées ont été déclarées"
      });
      return;
    }

    // Simulation de génération du rapport
    const reportData = {
      period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      entries: undeclaredEntries.length,
      totalValue: undeclaredEntries.reduce((sum, entry) => sum + entry.purchasePrice, 0)
    };

    toast({
      title: "Rapport généré",
      description: `${reportData.entries} entrées à déclarer pour un montant de ${reportData.totalValue}€`
    });
  };

  const exportToExcel = () => {
    // Simulation d'export Excel
    const data = filteredEntries.map(entry => ({
      'Numéro': entry.entryNumber,
      'Date': entry.date,
      'Heure': entry.time,
      'Vendeur': entry.sellerName,
      'Type ID': entry.sellerIdType,
      'N° ID': entry.sellerIdNumber,
      'Adresse': entry.sellerAddress,
      'Téléphone': entry.sellerPhone,
      'Type objet': entry.itemType,
      'Marque': entry.brand,
      'Modèle': entry.model,
      'IMEI': entry.imei || '',
      'Couleur': entry.color,
      'Prix achat': entry.purchasePrice,
      'Statut': entry.status,
      'Déclaré': entry.declarationSent ? 'Oui' : 'Non'
    }));

    toast({
      title: "Export réussi",
      description: `${data.length} entrées exportées`
    });
  };

  const printLogbook = () => {
    toast({
      title: "Impression en cours",
      description: "Le livre de police est en cours d'impression"
    });
  };

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Lock className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Module livre de police numérique</h3>
          <p className="text-muted-foreground mb-4">
            Ce module premium vous permet de tenir un livre de police numérique conforme à la réglementation.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-4">
            <p className="font-medium text-sm">Fonctionnalités incluses :</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Enregistrement numérique sécurisé</li>
              <li>• Photos et documentation complète</li>
              <li>• Horodatage et traçabilité</li>
              <li>• Exports et déclarations automatiques</li>
              <li>• Conformité réglementaire garantie</li>
            </ul>
          </div>
          <Button className="w-full max-w-xs">
            Souscrire au module (19€/mois)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entrées totales</p>
              <p className="text-2xl font-bold">{entries.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Déclarées</p>
              <p className="text-2xl font-bold">{entries.filter(e => e.declarationSent).length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold">{entries.filter(e => !e.declarationSent).length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Shield className="w-8 h-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ce mois</p>
              <p className="text-2xl font-bold">
                {entries.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Livre de police numérique
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateDeclarationReport}>
                <FileText className="w-4 h-4 mr-2" />
                Déclaration
              </Button>
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Exporter le livre de police</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Choisissez le format d'export pour votre livre de police
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={exportToExcel} className="h-20 flex-col">
                        <Download className="w-6 h-6 mb-2" />
                        Excel (.xlsx)
                      </Button>
                      <Button onClick={printLogbook} variant="outline" className="h-20 flex-col">
                        <Printer className="w-6 h-6 mb-2" />
                        Imprimer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par numéro, vendeur, marque, modèle ou IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">En stock</option>
              <option value="sold">Vendu</option>
              <option value="destroyed">Détruit</option>
              <option value="returned">Restitué</option>
            </select>
          </div>

          {/* Tableau des entrées */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Entrée</TableHead>
                <TableHead>Date/Heure</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Déclaration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{entry.date}</div>
                      <div className="text-muted-foreground">{entry.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{entry.sellerName}</div>
                      <div className="text-muted-foreground">{entry.sellerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{entry.brand} {entry.model}</div>
                      <div className="text-muted-foreground">{entry.color}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 rounded">
                      {entry.imei || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{entry.purchasePrice}€</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    {entry.declarationSent ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">{entry.declarationDate}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">En attente</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de détail d'une entrée */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Entrée {selectedEntry.entryNumber} - {selectedEntry.brand} {selectedEntry.model}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="seller">Vendeur</TabsTrigger>
                <TabsTrigger value="item">Objet</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Numéro d'entrée</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.entryNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date et heure</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.date} à {selectedEntry.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Créé par</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.createdBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Statut</label>
                    <div className="mt-1">{getStatusBadge(selectedEntry.status)}</div>
                  </div>
                </div>
                
                {selectedEntry.status === 'sold' && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Informations de vente</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="font-medium">Date de vente</label>
                        <p className="text-muted-foreground">{selectedEntry.soldDate}</p>
                      </div>
                      <div>
                        <label className="font-medium">Vendu à</label>
                        <p className="text-muted-foreground">{selectedEntry.soldTo}</p>
                      </div>
                      <div>
                        <label className="font-medium">Prix de vente</label>
                        <p className="text-muted-foreground">{selectedEntry.soldPrice}€</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="seller" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom complet</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.sellerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Téléphone</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.sellerPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type de pièce d'identité</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.sellerIdType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Numéro de pièce</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.sellerIdNumber}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Adresse</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.sellerAddress}</p>
                </div>
                {selectedEntry.sellerEmail && (
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.sellerEmail}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="item" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type d'objet</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.itemType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Marque et modèle</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.brand} {selectedEntry.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">IMEI</label>
                    <p className="text-sm text-muted-foreground font-mono">{selectedEntry.imei || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Couleur</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.color}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prix d'achat</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.purchasePrice}€</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valeur estimée</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.estimatedValue}€</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">État de l'objet</label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.condition}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="documentation" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Photos ({selectedEntry.photos.length})</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {selectedEntry.photos.map((photo, index) => (
                      <div key={index} className="bg-muted rounded p-4 text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Photo {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedEntry.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm text-muted-foreground">{selectedEntry.notes}</p>
                  </div>
                )}
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Déclaration administrative</h4>
                  {selectedEntry.declarationSent ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">Déclaration envoyée le {selectedEntry.declarationDate}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Déclaration en attente</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DigitalPoliceLogbook;