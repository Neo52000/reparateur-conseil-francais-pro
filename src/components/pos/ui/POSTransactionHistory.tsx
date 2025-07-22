import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Receipt,
  Search,
  Filter,
  Printer,
  RefreshCw,
  Eye,
  Calendar,
  CreditCard,
  Banknote
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  transactionNumber: string;
  date: Date;
  customerName?: string;
  customerNumber?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'card' | 'cash' | 'check' | 'mobile_pay';
  status: 'completed' | 'refunded' | 'cancelled';
  cashierName: string;
  receiptPrinted: boolean;
}

interface POSTransactionHistoryProps {
  repairer_id: string;
}

const POSTransactionHistory: React.FC<POSTransactionHistoryProps> = ({ repairer_id }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Données de démonstration
  const demoTransactions: Transaction[] = [
    {
      id: '1',
      transactionNumber: 'TXN-20250119-0001',
      date: new Date(),
      customerName: 'Marie Dubois',
      customerNumber: 'C24-00001',
      items: [
        { name: 'Écran iPhone 13', quantity: 1, price: 149.90 },
        { name: 'Vitre Protection', quantity: 1, price: 25.00 }
      ],
      subtotal: 174.90,
      tax: 34.98,
      total: 209.88,
      paymentMethod: 'card',
      status: 'completed',
      cashierName: 'Jean Martin',
      receiptPrinted: true
    },
    {
      id: '2',
      transactionNumber: 'TXN-20250119-0002',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      customerName: 'Pierre Durand',
      customerNumber: 'C24-00002',
      items: [
        { name: 'Diagnostic', quantity: 1, price: 35.00 }
      ],
      subtotal: 35.00,
      tax: 7.00,
      total: 42.00,
      paymentMethod: 'cash',
      status: 'completed',
      cashierName: 'Jean Martin',
      receiptPrinted: true
    },
    {
      id: '3',
      transactionNumber: 'TXN-20250119-0003',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000),
      items: [
        { name: 'Nettoyage', quantity: 1, price: 15.00 },
        { name: 'Film Hydrogel', quantity: 1, price: 20.00 }
      ],
      subtotal: 35.00,
      tax: 7.00,
      total: 42.00,
      paymentMethod: 'card',
      status: 'completed',
      cashierName: 'Jean Martin',
      receiptPrinted: false
    }
  ];

  useEffect(() => {
    loadTransactions();
  }, [repairer_id]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, paymentFilter]);

  const loadTransactions = async () => {
    setIsLoading(true);
    // Simulation - en réalité, appel API
    setTimeout(() => {
      setTransactions(demoTransactions);
      setIsLoading(false);
    }, 500);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre de statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filtre de paiement
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === paymentFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-admin-green text-white">Terminé</Badge>;
      case 'refunded':
        return <Badge variant="destructive">Remboursé</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Annulé</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Carte';
      case 'cash': return 'Espèces';
      case 'check': return 'Chèque';
      case 'mobile_pay': return 'Paiement Mobile';
      default: return method;
    }
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    // Logique d'impression
    console.log('Printing receipt for transaction:', transaction.transactionNumber);
  };

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Historique des Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les paiements</SelectItem>
                <SelectItem value="card">Carte</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
                <SelectItem value="mobile_pay">Mobile</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadTransactions} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des transactions */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Chargement des transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucune transaction trouvée
            </div>
          ) : (
            <div className="divide-y">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium">{transaction.transactionNumber}</div>
                        {getStatusBadge(transaction.status)}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          {getPaymentMethodText(transaction.paymentMethod)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Date</div>
                          <div>{format(transaction.date, 'dd/MM/yyyy HH:mm', { locale: fr })}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Client</div>
                          <div>{transaction.customerName || 'Client anonyme'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Articles</div>
                          <div>{transaction.items.length} article(s)</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-bold text-primary">{transaction.total.toFixed(2)}€</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePrintReceipt(transaction)}
                        className={!transaction.receiptPrinted ? 'text-admin-orange' : ''}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog détail transaction */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détail de la Transaction</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* En-tête transaction */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Numéro</div>
                  <div className="font-medium">{selectedTransaction.transactionNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div>{format(selectedTransaction.date, 'dd/MM/yyyy HH:mm', { locale: fr })}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Client</div>
                  <div>{selectedTransaction.customerName || 'Client anonyme'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Caissier</div>
                  <div>{selectedTransaction.cashierName}</div>
                </div>
              </div>

              {/* Articles */}
              <div>
                <h4 className="font-medium mb-3">Articles</h4>
                <div className="border rounded-lg">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">Quantité: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{(item.price * item.quantity).toFixed(2)}€</div>
                        <div className="text-sm text-muted-foreground">{item.price}€/unité</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totaux */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{selectedTransaction.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (20%)</span>
                  <span>{selectedTransaction.tax.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{selectedTransaction.total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handlePrintReceipt(selectedTransaction)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer Ticket
                </Button>
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSTransactionHistory;