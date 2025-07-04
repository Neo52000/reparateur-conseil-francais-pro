import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Search, 
  Eye, 
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Euro
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  created_at: string;
  orders?: Order[];
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export const CustomersManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les clients
  const loadCustomers = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ecommerce_customers')
        .select(`
          *,
          ecommerce_orders (
            id,
            order_number,
            total_amount,
            status,
            payment_status,
            created_at
          )
        `)
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calculer les statistiques pour chaque client
      const customersWithStats = (data || []).map(customer => {
        const orders = Array.isArray(customer.ecommerce_orders) ? customer.ecommerce_orders : [];
        const paidOrders = orders.filter((order: any) => order.payment_status === 'paid');
        
        return {
          ...customer,
          orders,
          total_orders: orders.length,
          total_spent: paidOrders.reduce((sum: number, order: any) => sum + order.total_amount, 0),
          last_order_date: orders.length > 0 ? orders[0].created_at : undefined
        };
      });
      
      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user?.id]);

  // Charger les détails d'un client spécifique
  const loadCustomerDetails = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('ecommerce_customers')
        .select(`
          *,
          ecommerce_orders (
            id,
            order_number,
            total_amount,
            status,
            payment_status,
            created_at
          )
        `)
        .eq('id', customerId)
        .single();

      if (error) throw error;
      
      const orders = Array.isArray(data.ecommerce_orders) ? data.ecommerce_orders : [];
      const customerWithStats = {
        ...data,
        orders,
        total_orders: orders.length,
        total_spent: orders
          .filter((order: any) => order.payment_status === 'paid')
          .reduce((sum: number, order: any) => sum + order.total_amount, 0),
        last_order_date: orders.length > 0 ? orders[0].created_at : undefined
      };
      
      setSelectedCustomer(customerWithStats);
    } catch (error) {
      console.error('Erreur chargement détails client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du client",
        variant: "destructive"
      });
    }
  };

  // Filtrer les clients
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           customer.email.toLowerCase().includes(searchLower) ||
           (customer.phone && customer.phone.includes(searchTerm));
  });

  // Calculer les statistiques globales
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter(c => {
      const createdDate = new Date(c.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length,
    withOrders: customers.filter(c => c.total_orders > 0).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0)
  };

  // Obtenir le badge de type de client
  const getCustomerTypeBadge = (customer: Customer) => {
    if (customer.total_orders === 0) {
      return <Badge variant="outline">Prospect</Badge>;
    }
    if (customer.total_orders === 1) {
      return <Badge variant="secondary">Nouveau</Badge>;
    }
    if (customer.total_orders >= 5) {
      return <Badge variant="default" className="bg-emerald-600">Fidèle</Badge>;
    }
    return <Badge variant="default">Régulier</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gestion des Clients
          </h2>
          <p className="text-muted-foreground">
            {customers.length} client{customers.length !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total clients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
                <p className="text-2xl font-bold">{stats.newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avec commandes</p>
                <p className="text-2xl font-bold">{stats.withOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">CA total</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table des clients */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Total dépensé</TableHead>
                <TableHead>Dernière commande</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Client depuis {format(new Date(customer.created_at), 'MM/yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.total_orders}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">€{customer.total_spent.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    {customer.last_order_date ? (
                      format(new Date(customer.last_order_date), 'dd/MM/yyyy', { locale: fr })
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getCustomerTypeBadge(customer)}
                  </TableCell>
                  <TableCell>
                    <Dialog 
                      open={isCustomerDetailOpen && selectedCustomer?.id === customer.id} 
                      onOpenChange={(open) => {
                        setIsCustomerDetailOpen(open);
                        if (!open) setSelectedCustomer(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            loadCustomerDetails(customer.id);
                            setIsCustomerDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>
                            Profil de {customer.first_name} {customer.last_name}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedCustomer && (
                          <div className="space-y-6">
                            {/* Informations personnelles */}
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-3">Informations personnelles</h4>
                                <div className="space-y-2">
                                  <p><strong>Nom complet:</strong> {selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                                  {selectedCustomer.phone && (
                                    <p><strong>Téléphone:</strong> {selectedCustomer.phone}</p>
                                  )}
                                  {selectedCustomer.address && (
                                    <div>
                                      <strong>Adresse:</strong>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedCustomer.address}<br />
                                        {selectedCustomer.postal_code} {selectedCustomer.city}
                                      </p>
                                    </div>
                                  )}
                                  <p><strong>Client depuis:</strong> {format(new Date(selectedCustomer.created_at), 'dd/MM/yyyy', { locale: fr })}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-3">Statistiques</h4>
                                <div className="space-y-2">
                                  <p><strong>Nombre de commandes:</strong> {selectedCustomer.total_orders}</p>
                                  <p><strong>Total dépensé:</strong> €{selectedCustomer.total_spent.toFixed(2)}</p>
                                  <p><strong>Panier moyen:</strong> €{selectedCustomer.total_orders > 0 ? (selectedCustomer.total_spent / selectedCustomer.total_orders).toFixed(2) : '0.00'}</p>
                                  {selectedCustomer.last_order_date && (
                                    <p><strong>Dernière commande:</strong> {format(new Date(selectedCustomer.last_order_date), 'dd/MM/yyyy', { locale: fr })}</p>
                                  )}
                                  <div><strong>Type de client:</strong> {getCustomerTypeBadge(selectedCustomer)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Historique des commandes */}
                            <div>
                              <h4 className="font-medium mb-3">Historique des commandes</h4>
                              {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>N° Commande</TableHead>
                                      <TableHead>Montant</TableHead>
                                      <TableHead>Statut</TableHead>
                                      <TableHead>Date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedCustomer.orders.map((order) => (
                                      <TableRow key={order.id}>
                                        <TableCell className="font-mono">
                                          {order.order_number}
                                        </TableCell>
                                        <TableCell>
                                          €{order.total_amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                            {order.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: fr })}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-muted-foreground">Aucune commande pour ce client</p>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Aucun client ne correspond aux critères' 
                  : 'Aucun client pour le moment'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};