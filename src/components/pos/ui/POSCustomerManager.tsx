import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  Edit,
  History
} from 'lucide-react';
import { CustomerService } from '@/services/pos/customerService';
import type { POSCustomer, CreatePOSCustomerData } from '@/services/pos/customerService';

interface POSCustomerManagerProps {
  onCustomerSelected?: (customer: POSCustomer) => void;
  selectedCustomerId?: string;
}

const POSCustomerManager: React.FC<POSCustomerManagerProps> = ({ 
  onCustomerSelected, 
  selectedCustomerId 
}) => {
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Formulaire nouveau client
  const [newCustomer, setNewCustomer] = useState<CreatePOSCustomerData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: null,
    preferred_contact: 'phone',
    marketing_consent: false,
    private_notes: '',
    tags: []
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await CustomerService.getCustomers('repairer-id');
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
    setIsLoading(false);
  };

  const searchCustomers = async () => {
    if (!searchTerm.trim()) {
      loadCustomers();
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await CustomerService.searchCustomers('repairer-id', searchTerm);
      setCustomers(data);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
    setIsLoading(false);
  };

  const handleCreateCustomer = async () => {
    try {
      const customer = await CustomerService.createCustomer('repairer-id', newCustomer);
      setCustomers(prev => [customer, ...prev]);
      setIsCreateDialogOpen(false);
      setNewCustomer({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: null,
        preferred_contact: 'phone',
        marketing_consent: false,
        private_notes: '',
        tags: []
      });
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const getLoyaltyBadgeVariant = (status: string) => {
    switch (status) {
      case 'platinum': return 'default';
      case 'gold': return 'secondary';
      case 'silver': return 'outline';
      default: return 'outline';
    }
  };

  const getLoyaltyBadgeColor = (status: string) => {
    switch (status) {
      case 'platinum': return 'bg-admin-purple text-white';
      case 'gold': return 'bg-admin-yellow text-foreground';
      case 'silver': return 'bg-muted text-foreground';
      default: return 'bg-background text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche et actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Gestion Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, téléphone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCustomers()}
                className="pl-10"
              />
            </div>
            <Button onClick={searchCustomers} variant="outline">
              Rechercher
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouveau Client</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom *</Label>
                    <Input
                      id="first_name"
                      value={newCustomer.first_name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom *</Label>
                    <Input
                      id="last_name"
                      value={newCustomer.last_name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_contact">Contact Préféré</Label>
                    <Select 
                      value={newCustomer.preferred_contact} 
                      onValueChange={(value: 'phone' | 'email' | 'sms') => 
                        setNewCustomer(prev => ({ ...prev, preferred_contact: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Téléphone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes privées</Label>
                    <Textarea
                      id="notes"
                      value={newCustomer.private_notes}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, private_notes: e.target.value }))}
                      placeholder="Notes internes sur le client..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateCustomer}
                    disabled={!newCustomer.first_name || !newCustomer.last_name}
                  >
                    Créer Client
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Liste des clients */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucun client trouvé
            </div>
          ) : (
            <div className="divide-y">
              {customers.map((customer) => (
                <div 
                  key={customer.id}
                  className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                    selectedCustomerId === customer.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    onCustomerSelected?.(customer);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.customer_number}
                          </div>
                        </div>
                        <Badge 
                          variant={getLoyaltyBadgeVariant(customer.loyalty_status)}
                          className={getLoyaltyBadgeColor(customer.loyalty_status)}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {customer.loyalty_status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {customer.loyalty_points} pts
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <History className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default POSCustomerManager;