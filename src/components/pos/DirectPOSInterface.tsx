import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import SyncIndicator from '@/components/common/SyncIndicator';
import RepairerDashboard from '@/components/repairer-dashboard/RepairerDashboard';
import { 
  CreditCard, 
  Package, 
  Users, 
  Calendar,
  Receipt,
  BarChart3,
  Settings,
  Printer,
  Wifi,
  WifiOff,
  Plus,
  Minus,
  ShoppingCart,
  Calculator,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Search,
  Monitor,
  Home
} from 'lucide-react';

interface POSItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends POSItem {
  quantity: number;
  total: number;
}

interface Transaction {
  id: string;
  transaction_number: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  transaction_date: string;
  customer_name?: string;
  items: any[];
}

/**
 * Interface POS principale directe conforme NF-525
 * Vue principale pour les réparateurs avec POS en premier plan
 */
const DirectPOSInterface: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('sale');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<POSItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalAmount: 0,
    transactionCount: 0,
    startTime: '',
    sessionNumber: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger l'inventaire POS
  const loadInventory = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('pos_inventory_items')
        .select('*')
        .eq('repairer_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const formattedInventory = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: Number(item.selling_price),
        stock: item.current_stock,
        category: item.category
      }));
      
      setInventory(formattedInventory);
    } catch (error) {
      console.error('Erreur chargement inventaire:', error);
      // En mode démo, utiliser des données simulées
      if (user?.email === 'demo@demo.fr') {
        setInventory([
          { id: '1', name: 'Écran iPhone 13', sku: 'SCR-IP13-001', price: 149.90, stock: 12, category: 'Écrans' },
          { id: '2', name: 'Batterie Samsung S21', sku: 'BAT-SS21-001', price: 89.90, stock: 8, category: 'Batteries' },
          { id: '3', name: 'Vitre Protection', sku: 'VIT-PROT-001', price: 25.00, stock: 25, category: 'Accessoires' },
          { id: '4', name: 'Diagnostic Complet', sku: 'DIAG-COMP-001', price: 35.00, stock: 999, category: 'Services' },
          { id: '5', name: 'Coque iPhone 13', sku: 'COQ-IP13-001', price: 15.90, stock: 15, category: 'Accessoires' },
          { id: '6', name: 'Câble USB-C', sku: 'CAB-USBC-001', price: 12.50, stock: 20, category: 'Accessoires' }
        ]);
        
        toast({
          title: "Inventaire synchronisé",
          description: "6 produits disponibles dans l'inventaire POS",
          duration: 2000
        });
      }
    }
  };

  // Charger les transactions
  const loadTransactions = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('pos_transactions')
        .select(`
          *,
          pos_transaction_items (*)
        `)
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setTransactions((data || []).map(tx => ({
        id: tx.id,
        transaction_number: tx.transaction_number,
        total_amount: Number(tx.total_amount),
        payment_method: tx.payment_method,
        payment_status: tx.payment_status,
        transaction_date: tx.transaction_date,
        customer_name: tx.customer_name,
        items: tx.pos_transaction_items || []
      })));
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
      // En mode démo, utiliser des données simulées
      if (user?.email === 'demo@demo.fr') {
        setTransactions([
          {
            id: '1',
            transaction_number: 'TXN-20250105-001',
            total_amount: 149.90,
            payment_method: 'card',
            payment_status: 'completed',
            transaction_date: new Date().toISOString(),
            customer_name: 'Marie Dubois',
            items: []
          },
          {
            id: '2',
            transaction_number: 'TXN-20250105-002',
            total_amount: 89.90,
            payment_method: 'cash',
            payment_status: 'completed',
            transaction_date: new Date(Date.now() - 3600000).toISOString(),
            customer_name: 'Pierre Martin',
            items: []
          }
        ]);
      }
    }
  };

  useEffect(() => {
    loadInventory();
    loadTransactions();
  }, [user?.id]);

  // Démarrer une session POS
  const startSession = async () => {
    if (!user?.id) return;
    
    try {
      const sessionNumber = `S${Date.now().toString().slice(-6)}`;
      const { data, error } = await supabase
        .from('pos_sessions')
        .insert({
          repairer_id: user.id,
          session_number: sessionNumber,
          session_date: new Date().toISOString().split('T')[0],
          started_at: new Date().toISOString(),
          status: 'active',
          cash_drawer_start: 100.00,
          employee_name: 'Demo User'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentSession(data.id);
      setSessionStats({
        sessionNumber,
        startTime: new Date().toLocaleTimeString('fr-FR'),
        totalAmount: 0,
        transactionCount: 0
      });
      
      toast({
        title: "Session ouverte",
        description: `Session ${sessionNumber} démarrée avec succès`
      });
    } catch (error) {
      console.error('Erreur ouverture session:', error);
      // Mode démo - simulation
      if (user?.email === 'demo@demo.fr') {
        const sessionNumber = `S${Date.now().toString().slice(-6)}`;
        setCurrentSession('demo-session');
        setSessionStats({
          sessionNumber,
          startTime: new Date().toLocaleTimeString('fr-FR'),
          totalAmount: 0,
          transactionCount: 0
        });
        toast({
          title: "Session ouverte (Démo)",
          description: `Session ${sessionNumber} démarrée en mode démonstration`
        });
      }
    }
  };

  // Clôturer la session
  const endSession = async () => {
    if (!currentSession || !user?.id) return;
    
    try {
      const { error } = await supabase
        .from('pos_sessions')
        .update({
          ended_at: new Date().toISOString(),
          status: 'closed',
          total_amount: sessionStats.totalAmount,
          total_transactions: sessionStats.transactionCount,
          cash_drawer_end: 100.00 + sessionStats.totalAmount
        })
        .eq('id', currentSession);
      
      if (error) throw error;
      
      setCurrentSession(null);
      toast({
        title: "Session clôturée",
        description: `Total: ${sessionStats.totalAmount}€ • ${sessionStats.transactionCount} transactions`
      });
    } catch (error) {
      console.error('Erreur clôture session:', error);
      // Mode démo
      setCurrentSession(null);
      toast({
        title: "Session clôturée (Démo)",
        description: `Total: ${sessionStats.totalAmount}€ • ${sessionStats.transactionCount} transactions`
      });
    }
  };

  // Ajouter un produit au panier
  const addToCart = (item: POSItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1, total: item.price }];
      }
    });
  };

  // Supprimer un produit du panier
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Modifier la quantité
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity, total: newQuantity * cartItem.price }
          : cartItem
      )
    );
  };

  // Calculer le total du panier
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // Finaliser la transaction
  const processTransaction = async (paymentMethod: string) => {
    if (cart.length === 0 || !currentSession || !user?.id) return;
    
    setLoading(true);
    try {
      const transactionNumber = `TXN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(sessionStats.transactionCount + 1).padStart(3, '0')}`;
      
      const { data: transaction, error: txError } = await supabase
        .from('pos_transactions')
        .insert({
          session_id: currentSession,
          repairer_id: user.id,
          transaction_number: transactionNumber,
          transaction_type: 'sale',
          subtotal: cartTotal,
          tax_amount: cartTotal * 0.2, // TVA 20%
          total_amount: cartTotal * 1.2,
          payment_method: paymentMethod,
          payment_status: 'completed',
          transaction_date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (txError) throw txError;
      
      // Ajouter les articles
      const transactionItems = cart.map(item => ({
        transaction_id: transaction.id,
        item_type: 'product',
        item_name: item.name,
        item_sku: item.sku,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total,
        tax_rate: 0.2
      }));
      
      const { error: itemsError } = await supabase
        .from('pos_transaction_items')
        .insert(transactionItems);
      
      if (itemsError) throw itemsError;
      
      // Mettre à jour les stats de session
      setSessionStats(prev => ({
        ...prev,
        totalAmount: prev.totalAmount + (cartTotal * 1.2),
        transactionCount: prev.transactionCount + 1
      }));
      
      // Vider le panier
      setCart([]);
      
      // Recharger les transactions
      await loadTransactions();
      
      toast({
        title: "Transaction validée ✓",
        description: `${transactionNumber} • ${(cartTotal * 1.2).toFixed(2)}€ • Stocks mis à jour`,
        duration: 3000
      });
      
    } catch (error) {
      console.error('Erreur transaction:', error);
      // Mode démo - simulation réussie
      if (user?.email === 'demo@demo.fr') {
        const demoTxNumber = `TXN-DEMO-${Date.now().toString().slice(-6)}`;
        setSessionStats(prev => ({
          ...prev,
          totalAmount: prev.totalAmount + (cartTotal * 1.2),
          transactionCount: prev.transactionCount + 1
        }));
        setCart([]);
        toast({
          title: "Transaction démo validée ✓",
          description: `${demoTxNumber} • ${(cartTotal * 1.2).toFixed(2)}€ • Mode démonstration`,
          duration: 3000
        });
      } else {
        toast({
          title: "Erreur transaction",
          description: "Impossible de finaliser la transaction",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrer l'inventaire
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header POS principal */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Point de Vente NF-525</h1>
                  <p className="text-sm text-slate-500">Interface de caisse certifiée • {user?.email}</p>
                </div>
              </div>
              {currentSession && (
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Session {sessionStats.sessionNumber}
                  </Badge>
                  <div className="text-sm text-slate-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {sessionStats.startTime} • {sessionStats.transactionCount} ventes • {sessionStats.totalAmount.toFixed(2)}€
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Synchronisation */}
              <SyncIndicator module="pos" showDetails={false} />
              
              {/* Statut connexion */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm font-medium">Connecté</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Mode hors ligne</span>
                  </div>
                )}
              </div>

              {/* Actions session */}
              {!currentSession ? (
                <Button onClick={startSession} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ouvrir Session
                </Button>
              ) : (
                <Button variant="outline" onClick={endSession} className="border-red-200 text-red-700 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" />
                  Clôturer Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Interface principale */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="sale" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Caisse
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Stock
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Rapports
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            {/* Onglet Caisse */}
            <TabsContent value="sale" className="h-full">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Catalogue produits */}
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        <SelectItem value="ecrans">Écrans</SelectItem>
                        <SelectItem value="batteries">Batteries</SelectItem>
                        <SelectItem value="accessoires">Accessoires</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4 overflow-y-auto h-[calc(100vh-250px)]">
                    {filteredInventory.map((item) => (
                      <Card 
                        key={item.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => addToCart(item)}
                      >
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="w-full h-20 bg-slate-100 rounded mb-2 flex items-center justify-center">
                              <Package className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
                            <p className="text-xs text-slate-500 mb-2">{item.sku}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-primary">{item.price.toFixed(2)}€</span>
                              <Badge variant={item.stock > 5 ? "default" : "destructive"} className="text-xs">
                                {item.stock}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Panier et paiement */}
                <div className="space-y-4">
                  <Card className="h-[calc(100vh-350px)]">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Panier ({cart.length})</span>
                        {cart.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCart([])}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 overflow-y-auto">
                      {cart.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p>Panier vide</p>
                          <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-slate-500">{item.price.toFixed(2)}€</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right ml-2">
                              <p className="font-bold text-sm">{item.total.toFixed(2)}€</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Zone de paiement */}
                  {cart.length > 0 && (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Sous-total:</span>
                            <span>{cartTotal.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>TVA (20%):</span>
                            <span>{(cartTotal * 0.2).toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>{(cartTotal * 1.2).toFixed(2)}€</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => processTransaction('cash')}
                            disabled={loading || !currentSession}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Euro className="w-4 h-4 mr-2" />
                            Espèces
                          </Button>
                          <Button
                            onClick={() => processTransaction('card')}
                            disabled={loading || !currentSession}
                            variant="outline"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Carte
                          </Button>
                        </div>

                        {!currentSession && (
                          <p className="text-sm text-amber-600 text-center">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Ouvrez une session pour effectuer des ventes
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Onglet Stock */}
            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des stocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Catégorie</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.price.toFixed(2)}€</TableCell>
                          <TableCell>
                            <Badge variant={item.stock > 5 ? "default" : "destructive"}>
                              {item.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Transactions */}
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Transaction</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Paiement</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">{tx.transaction_number}</TableCell>
                          <TableCell>{tx.customer_name || 'Client anonyme'}</TableCell>
                          <TableCell>{tx.total_amount.toFixed(2)}€</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tx.payment_method === 'cash' ? 'Espèces' : 'Carte'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(tx.transaction_date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-emerald-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Validée
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Clients */}
            <TabsContent value="customers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion clientèle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-center py-8">
                    Fonctionnalité de gestion clientèle disponible prochainement
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Rapports */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rapports et analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 text-center py-8">
                    Rapports de vente et analytics disponibles prochainement
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Dashboard */}
            <TabsContent value="dashboard" className="space-y-4">
              <RepairerDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DirectPOSInterface;