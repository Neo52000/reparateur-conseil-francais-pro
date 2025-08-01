import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Package, 
  Truck, 
  ShoppingCart,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useSupplierManagement, Supplier, PurchaseOrder } from '@/hooks/useSupplierManagement';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SupplierManagement: React.FC = () => {
  const {
    suppliers,
    purchaseOrders,
    loading,
    createSupplier,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    generateAutoOrder,
  } = useSupplierManagement();

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    contact_person: '',
    city: '',
    country: '',
    payment_terms: '',
    delivery_time_days: 7,
    minimum_order_amount: 0,
  });

  const [orderForm, setOrderForm] = useState({
    supplier_id: '',
    expected_delivery: '',
    notes: '',
    items: [{ inventory_item_id: '', quantity: 1, unit_price: 0 }]
  });

  const handleCreateSupplier = async () => {
    try {
      await createSupplier({
        ...supplierForm,
        is_active: true,
        repairer_id: 'current_user_id' // This should come from auth context
      });
      setIsSupplierFormOpen(false);
      setSupplierForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        contact_person: '',
        city: '',
        country: '',
        payment_terms: '',
        delivery_time_days: 7,
        minimum_order_amount: 0,
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const totalAmount = orderForm.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );

      await createPurchaseOrder(
        {
          supplier_id: orderForm.supplier_id,
          expected_delivery: orderForm.expected_delivery || undefined,
          notes: orderForm.notes,
          total_amount_ttc: totalAmount,
          repairer_id: 'current_user_id',
          status: 'draft',
          order_date: new Date().toISOString(),
        },
        orderForm.items
      );

      setIsOrderFormOpen(false);
      setOrderForm({
        supplier_id: '',
        expected_delivery: '',
        notes: '',
        items: [{ inventory_item_id: '', quantity: 1, unit_price: 0 }]
      });
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Brouillon', icon: Edit },
      sent: { variant: 'default' as const, label: 'Envoyée', icon: Clock },
      confirmed: { variant: 'default' as const, label: 'Confirmée', icon: CheckCircle },
      received: { variant: 'default' as const, label: 'Reçue', icon: Package },
      cancelled: { variant: 'destructive' as const, label: 'Annulée', icon: AlertCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Truck className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fournisseurs actifs</p>
              <p className="text-2xl font-bold">{suppliers.filter(s => s.is_active).length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <ShoppingCart className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Commandes en cours</p>
              <p className="text-2xl font-bold">
                {purchaseOrders.filter(o => ['sent', 'confirmed'].includes(o.status)).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Réceptions ce mois</p>
              <p className="text-2xl font-bold">
                {purchaseOrders.filter(o => 
                  o.status === 'received' && 
                  new Date(o.updated_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Commandes en retard</p>
              <p className="text-2xl font-bold">
                {purchaseOrders.filter(o => 
                  o.expected_delivery && 
                  new Date(o.expected_delivery) < new Date() && 
                  o.status !== 'received'
                ).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des Fournisseurs</CardTitle>
            <div className="flex gap-2">
              <Dialog open={isSupplierFormOpen} onOpenChange={setIsSupplierFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau fournisseur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nouveau fournisseur</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm(prev => ({...prev, email: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        value={supplierForm.website}
                        onChange={(e) => setSupplierForm(prev => ({...prev, website: e.target.value}))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Textarea
                        id="address"
                        value={supplierForm.address}
                        onChange={(e) => setSupplierForm(prev => ({...prev, address: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="terms">Conditions de paiement</Label>
                      <Input
                        id="terms"
                        value={supplierForm.payment_terms}
                        onChange={(e) => setSupplierForm(prev => ({...prev, payment_terms: e.target.value}))}
                        placeholder="ex: Net 30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leadtime">Délai livraison (jours)</Label>
                      <Input
                        id="leadtime"
                        type="number"
                        value={supplierForm.delivery_time_days}
                        onChange={(e) => setSupplierForm(prev => ({...prev, delivery_time_days: parseInt(e.target.value)}))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsSupplierFormOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateSupplier} disabled={!supplierForm.name}>
                      Créer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isOrderFormOpen} onOpenChange={setIsOrderFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Nouvelle commande
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Nouvelle commande d'achat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="supplier">Fournisseur *</Label>
                        <Select value={orderForm.supplier_id} onValueChange={(value) => 
                          setOrderForm(prev => ({...prev, supplier_id: value}))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un fournisseur" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.filter(s => s.is_active).map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="delivery">Livraison prévue</Label>
                        <Input
                          id="delivery"
                          type="date"
                          value={orderForm.expected_delivery}
                          onChange={(e) => setOrderForm(prev => ({...prev, expected_delivery: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm(prev => ({...prev, notes: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsOrderFormOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateOrder} disabled={!orderForm.supplier_id}>
                      Créer commande
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="suppliers" className="w-full">
            <TabsList>
              <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
            </TabsList>

            <TabsContent value="suppliers">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Délai</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            {supplier.website && (
                              <p className="text-sm text-muted-foreground">{supplier.website}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {supplier.email && (
                              <p className="text-sm">{supplier.email}</p>
                            )}
                            {supplier.phone && (
                              <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {supplier.delivery_time_days && `${supplier.delivery_time_days} jours`}
                        </TableCell>
                        <TableCell>{supplier.payment_terms}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.is_active ? "default" : "secondary"}>
                            {supplier.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Commande</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Livraison</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <code className="text-sm">{order.order_number}</code>
                        </TableCell>
                        <TableCell>{order.supplier?.name}</TableCell>
                        <TableCell>
                          {new Date(order.order_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{(order.total_amount_ttc || 0).toFixed(2)}€</TableCell>
                        <TableCell>
                          {order.expected_delivery && 
                            new Date(order.expected_delivery).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updatePurchaseOrderStatus(order.id, 'sent')}
                              disabled={order.status !== 'draft'}
                            >
                              Envoyer
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};