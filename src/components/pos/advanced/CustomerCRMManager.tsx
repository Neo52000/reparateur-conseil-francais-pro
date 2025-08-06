import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Heart, 
  Gift, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  ShoppingCart,
  Wrench,
  MessageSquare,
  QrCode,
  Trophy,
  Target,
  Send,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  lastVisit: string;
  createdAt: string;
  notes: string;
  preferences: Record<string, any>;
}

interface CustomerHistory {
  id: string;
  type: 'sale' | 'repair' | 'visit' | 'support';
  date: string;
  amount?: number;
  description: string;
  status: string;
  technician?: string;
}

interface LoyaltyCard {
  id: string;
  customerId: string;
  cardNumber: string;
  qrCode: string;
  points: number;
  tier: string;
  expiryDate: string;
  isActive: boolean;
}

interface Campaign {
  id: string;
  name: string;
  type: 'promotional' | 'follow_up' | 'birthday' | 'retention';
  status: 'draft' | 'active' | 'completed';
  targetSegment: string;
  message: string;
  sendDate: string;
  recipientCount: number;
}

const CustomerCRMManager: React.FC = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<CustomerHistory[]>([]);
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomerDialog, setNewCustomerDialog] = useState(false);
  const [campaignDialog, setCampaignDialog] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadCampaigns();
    loadLoyaltyCards();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Simulation de données pour la démo
      const mockCustomers: Customer[] = [
        {
          id: '1',
          number: 'C24-00001',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@email.com',
          phone: '0123456789',
          address: '123 Rue de la Paix, 75001 Paris',
          loyaltyPoints: 1250,
          loyaltyTier: 'gold',
          totalSpent: 850.50,
          lastVisit: '2024-01-20',
          createdAt: '2023-03-15',
          notes: 'Client fidèle, préfère les réparations express',
          preferences: { notifications: true, marketing: false }
        },
        {
          id: '2',
          number: 'C24-00002',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@email.com',
          phone: '0987654321',
          address: '456 Avenue des Champs, 75008 Paris',
          loyaltyPoints: 650,
          loyaltyTier: 'silver',
          totalSpent: 425.00,
          lastVisit: '2024-01-18',
          createdAt: '2023-07-22',
          notes: 'Intéressée par les accessoires premium',
          preferences: { notifications: true, marketing: true }
        }
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerHistory = async (customerId: string) => {
    // Simulation des données d'historique
    const mockHistory: CustomerHistory[] = [
      {
        id: '1',
        type: 'repair',
        date: '2024-01-20',
        amount: 85.00,
        description: 'Réparation écran iPhone 12',
        status: 'completed',
        technician: 'Pierre Technicien'
      },
      {
        id: '2',
        type: 'sale',
        date: '2024-01-15',
        amount: 25.50,
        description: 'Coque de protection',
        status: 'completed'
      },
      {
        id: '3',
        type: 'support',
        date: '2024-01-10',
        amount: 0,
        description: 'Conseil technique par téléphone',
        status: 'completed'
      }
    ];
    setCustomerHistory(mockHistory);
  };

  const loadCampaigns = async () => {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Promotion Réparations -20%',
        type: 'promotional',
        status: 'active',
        targetSegment: 'Clients Gold',
        message: 'Profitez de -20% sur toutes vos réparations ce mois-ci !',
        sendDate: '2024-01-25',
        recipientCount: 156
      },
      {
        id: '2',
        name: 'Relance SAV J+30',
        type: 'follow_up',
        status: 'active',
        targetSegment: 'Réparations récentes',
        message: 'Comment va votre appareil depuis la réparation ?',
        sendDate: '2024-01-22',
        recipientCount: 23
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const loadLoyaltyCards = async () => {
    const mockCards: LoyaltyCard[] = [
      {
        id: '1',
        customerId: '1',
        cardNumber: 'LC001234567890',
        qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMDAiLz48L3N2Zz4=',
        points: 1250,
        tier: 'gold',
        expiryDate: '2025-03-15',
        isActive: true
      }
    ];
    setLoyaltyCards(mockCards);
  };

  const createCustomer = async (customerData: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      number: `C24-${String(customers.length + 1).padStart(5, '0')}`,
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      address: customerData.address || '',
      loyaltyPoints: 0,
      loyaltyTier: 'bronze',
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      notes: customerData.notes || '',
      preferences: { notifications: true, marketing: false }
    };

    setCustomers([...customers, newCustomer]);
    setNewCustomerDialog(false);
    
    toast({
      title: "Client créé",
      description: `${newCustomer.firstName} ${newCustomer.lastName} a été ajouté`,
    });
  };

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campaignData.name || '',
      type: campaignData.type || 'promotional',
      status: 'draft',
      targetSegment: campaignData.targetSegment || '',
      message: campaignData.message || '',
      sendDate: campaignData.sendDate || '',
      recipientCount: 0
    };

    setCampaigns([...campaigns, newCampaign]);
    setCampaignDialog(false);
    
    toast({
      title: "Campagne créée",
      description: `${newCampaign.name} a été programmée`,
    });
  };

  const generateLoyaltyCard = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newCard: LoyaltyCard = {
      id: Date.now().toString(),
      customerId,
      cardNumber: `LC${Date.now()}`,
      qrCode: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMDAiLz48L3N2Zz4=`,
      points: customer.loyaltyPoints,
      tier: customer.loyaltyTier,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    };

    setLoyaltyCards([...loyaltyCards, newCard]);
    
    toast({
      title: "Carte fidélité générée",
      description: `Carte créée pour ${customer.firstName} ${customer.lastName}`,
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ShoppingCart className="h-4 w-4" />;
      case 'repair': return <Wrench className="h-4 w-4" />;
      case 'support': return <MessageSquare className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CRM Clients</h2>
          <p className="text-muted-foreground">
            Gestion avancée de la relation client et fidélisation
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newCustomerDialog} onOpenChange={setNewCustomerDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau Client</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle fiche client
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createCustomer({
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  address: formData.get('address') as string,
                  notes: formData.get('notes') as string,
                });
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" name="phone" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" name="address" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setNewCustomerDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={campaignDialog} onOpenChange={setCampaignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Nouvelle Campagne
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle Campagne</DialogTitle>
                <DialogDescription>
                  Créer une campagne marketing automatisée
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createCampaign({
                  name: formData.get('name') as string,
                  type: formData.get('type') as any,
                  targetSegment: formData.get('targetSegment') as string,
                  message: formData.get('message') as string,
                  sendDate: formData.get('sendDate') as string,
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la campagne</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promotionnelle</SelectItem>
                      <SelectItem value="follow_up">Relance SAV</SelectItem>
                      <SelectItem value="birthday">Anniversaire</SelectItem>
                      <SelectItem value="retention">Fidélisation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetSegment">Segment cible</Label>
                  <Input id="targetSegment" name="targetSegment" required />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={3} required />
                </div>
                <div>
                  <Label htmlFor="sendDate">Date d'envoi</Label>
                  <Input id="sendDate" name="sendDate" type="date" required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCampaignDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">
            <Users className="mr-2 h-4 w-4" />
            Clients ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Mail className="mr-2 h-4 w-4" />
            Campagnes ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <Heart className="mr-2 h-4 w-4" />
            Fidélité ({loyaltyCards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base Clients</CardTitle>
              <CardDescription>
                Gestion et suivi de votre clientèle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut Fidélité</TableHead>
                    <TableHead>Total Dépensé</TableHead>
                    <TableHead>Dernière Visite</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getTierBadgeColor(customer.loyaltyTier)}>
                            {customer.loyaltyTier.toUpperCase()}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {customer.loyaltyPoints} points
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>€{customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>{customer.lastVisit}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              loadCustomerHistory(customer.id);
                            }}
                          >
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateLoyaltyCard(customer.id)}
                          >
                            <QrCode className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Historique - {selectedCustomer.firstName} {selectedCustomer.lastName}
                </CardTitle>
                <CardDescription>
                  Détail des interactions et transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getTypeIcon(item.type)}
                            <span className="ml-2 capitalize">{item.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          {item.amount ? `€${item.amount.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes Marketing</CardTitle>
              <CardDescription>
                Automatisation et suivi des campagnes client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campagne</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Date d'envoi</TableHead>
                    <TableHead>Destinataires</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {campaign.message}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{campaign.type}</TableCell>
                      <TableCell>{campaign.targetSegment}</TableCell>
                      <TableCell>{campaign.sendDate}</TableCell>
                      <TableCell>{campaign.recipientCount}</TableCell>
                      <TableCell>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Points Distribués
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15,420</div>
                <p className="text-xs text-muted-foreground">
                  +12% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cartes Actives
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loyaltyCards.filter(card => card.isActive).length}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((loyaltyCards.filter(card => card.isActive).length / customers.length) * 100)}% des clients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux d'Engagement
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +5% ce mois-ci
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cartes de Fidélité</CardTitle>
              <CardDescription>
                Gestion des cartes et programmes de fidélité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro de Carte</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loyaltyCards.map((card) => {
                    const customer = customers.find(c => c.id === card.customerId);
                    return (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="font-mono text-sm">{card.cardNumber}</div>
                        </TableCell>
                        <TableCell>
                          {customer ? `${customer.firstName} ${customer.lastName}` : 'Client inconnu'}
                        </TableCell>
                        <TableCell>{card.points}</TableCell>
                        <TableCell>
                          <Badge className={getTierBadgeColor(card.tier)}>
                            {card.tier.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{card.expiryDate}</TableCell>
                        <TableCell>
                          <Badge variant={card.isActive ? 'default' : 'secondary'}>
                            {card.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <QrCode className="h-3 w-3 mr-1" />
                            QR Code
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerCRMManager;