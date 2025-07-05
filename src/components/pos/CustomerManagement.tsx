import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Star,
  ShoppingBag,
  Gift,
  TrendingUp,
  Eye
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_date: string;
  last_visit: string;
  total_purchases: number;
  purchase_count: number;
  loyalty_points: number;
  preferred_categories: string[];
  notes: string;
  status: 'active' | 'inactive' | 'vip';
}

interface CustomerManagementProps {
  onSelectCustomer?: (customer: Customer) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ onSelectCustomer }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  // Données simulées de clients
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Marie Dubois',
        email: 'marie.dubois@email.com',
        phone: '06 12 34 56 78',
        address: '123 Rue de la Paix, Paris',
        registration_date: '2024-01-15',
        last_visit: '2024-12-20',
        total_purchases: 450.80,
        purchase_count: 3,
        loyalty_points: 45,
        preferred_categories: ['Écrans', 'Batteries'],
        notes: 'Cliente fidèle, préfère les paiements par carte',
        status: 'vip'
      },
      {
        id: '2',
        name: 'Pierre Martin',
        email: 'pierre.martin@email.com',
        phone: '06 98 76 54 32',
        address: '456 Avenue des Champs, Lyon',
        registration_date: '2024-03-22',
        last_visit: '2024-12-18',
        total_purchases: 89.90,
        purchase_count: 1,
        loyalty_points: 9,
        preferred_categories: ['Accessoires'],
        notes: 'Premier achat, intéressé par les protections d\'écran',
        status: 'active'
      },
      {
        id: '3',
        name: 'Sophie Leblanc',
        email: 'sophie.leblanc@email.com',
        phone: '06 45 67 89 12',
        address: '789 Boulevard Victor Hugo, Marseille',
        registration_date: '2023-11-10',
        last_visit: '2024-11-05',
        total_purchases: 230.50,
        purchase_count: 2,
        loyalty_points: 23,
        preferred_categories: ['Services', 'Écrans'],
        notes: 'Diagnostics réguliers, très satisfaite du service',
        status: 'active'
      }
    ];

    setCustomers(mockCustomers);
    setFilteredCustomers(mockCustomers);
  }, []);

  // Filtrage des clients
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === filterStatus);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'active': return 'bg-emerald-600';
      case 'inactive': return 'bg-slate-400';
      default: return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vip': return <Star className="w-3 h-3" />;
      case 'active': return <Users className="w-3 h-3" />;
      case 'inactive': return <Users className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onSelectCustomer?.(customer);
  };

  return (
    <div className="space-y-6">
      {/* En-tête et actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Gestion Clientèle</h2>
            <p className="text-sm text-muted-foreground">
              {customers.length} clients • {customers.filter(c => c.status === 'vip').length} VIP
            </p>
          </div>
        </div>
        <Button onClick={() => setShowNewCustomerDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nouveau Client
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {customers.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Clients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {customers.filter(c => c.status === 'vip').length}
            </div>
            <div className="text-sm text-muted-foreground">Clients VIP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {customers.reduce((sum, c) => sum + c.total_purchases, 0).toFixed(0)}€
            </div>
            <div className="text-sm text-muted-foreground">CA Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(customers.reduce((sum, c) => sum + c.total_purchases, 0) / customers.length).toFixed(0)}€
            </div>
            <div className="text-sm text-muted-foreground">Panier Moyen</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Tous les statuts</option>
          <option value="vip">VIP</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      {/* Liste des clients */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière visite</TableHead>
                <TableHead>Achats</TableHead>
                <TableHead>Points fidélité</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(customer.status)}>
                      {getStatusIcon(customer.status)}
                      <span className="ml-1 capitalize">{customer.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {new Date(customer.last_visit).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.total_purchases.toFixed(2)}€</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.purchase_count} commande{customer.purchase_count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Gift className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">{customer.loyalty_points}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Profil Client</DialogTitle>
                          </DialogHeader>
                          <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="info">Informations</TabsTrigger>
                              <TabsTrigger value="history">Historique</TabsTrigger>
                              <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
                            </TabsList>
                            <TabsContent value="info" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Nom complet</label>
                                  <div className="text-sm text-muted-foreground">{customer.name}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Téléphone</label>
                                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Statut</label>
                                  <Badge className={getStatusColor(customer.status)}>
                                    {customer.status}
                                  </Badge>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Adresse</label>
                                  <div className="text-sm text-muted-foreground">{customer.address}</div>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Notes</label>
                                  <div className="text-sm text-muted-foreground">{customer.notes}</div>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="history" className="space-y-4">
                              <div className="text-center py-8 text-muted-foreground">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Historique des achats disponible prochainement</p>
                              </div>
                            </TabsContent>
                            <TabsContent value="loyalty" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Gift className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                                    <div className="text-2xl font-bold">{customer.loyalty_points}</div>
                                    <div className="text-sm text-muted-foreground">Points fidélité</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                    <div className="text-2xl font-bold">{customer.purchase_count}</div>
                                    <div className="text-sm text-muted-foreground">Commandes</div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        Sélectionner
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun client trouvé</p>
        </div>
      )}

      {/* Dialog nouveau client */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nom complet" />
            <Input placeholder="Email" type="email" />
            <Input placeholder="Téléphone" />
            <Input placeholder="Adresse" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewCustomerDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowNewCustomerDialog(false)}>
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;