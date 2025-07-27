import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Percent, 
  Plus, 
  Tag, 
  Gift, 
  Calendar,
  Euro,
  Target,
  TrendingUp,
  Clock,
  Users,
  ShoppingCart,
  Copy,
  Eye,
  EyeOff,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'loyalty';
  value: number;
  applicableItems: string[];
  customerSegment: string;
  minimumAmount?: number;
  maximumDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  code?: string;
  autoApply: boolean;
  createdAt: string;
}

interface Voucher {
  id: string;
  code: string;
  type: 'discount' | 'credit' | 'gift';
  value: number;
  description: string;
  issuedTo?: string;
  issuedDate: string;
  expiryDate: string;
  isUsed: boolean;
  usedDate?: string;
  usedBy?: string;
  restrictions?: string;
}

interface LayawayOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  depositPercentage: number;
  dueDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'overdue';
  createdAt: string;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
  }>;
}

const PromotionsManager: React.FC = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [layawayOrders, setLayawayOrders] = useState<LayawayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotionDialog, setPromotionDialog] = useState(false);
  const [voucherDialog, setVoucherDialog] = useState(false);
  const [layawayDialog, setLayawayDialog] = useState(false);

  useEffect(() => {
    loadPromotions();
    loadVouchers();
    loadLayawayOrders();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      // Simulation de données pour la démo
      const mockPromotions: Promotion[] = [
        {
          id: '1',
          name: 'Réparations -20%',
          description: 'Réduction de 20% sur toutes les réparations écran',
          type: 'percentage',
          value: 20,
          applicableItems: ['réparation-écran'],
          customerSegment: 'tous',
          minimumAmount: 50,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          isActive: true,
          usageCount: 45,
          usageLimit: 100,
          code: 'REPAIR20',
          autoApply: false,
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Clients VIP - 10€ offerts',
          description: 'Réduction fixe pour les clients Gold et Platinum',
          type: 'fixed',
          value: 10,
          applicableItems: ['tous'],
          customerSegment: 'vip',
          minimumAmount: 100,
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          isActive: true,
          usageCount: 12,
          autoApply: true,
          createdAt: '2024-01-15'
        }
      ];
      setPromotions(mockPromotions);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les promotions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVouchers = async () => {
    const mockVouchers: Voucher[] = [
      {
        id: '1',
        code: 'AVOIR2024001',
        type: 'credit',
        value: 25.50,
        description: 'Avoir suite remboursement réparation',
        issuedTo: 'Jean Dupont',
        issuedDate: '2024-01-20',
        expiryDate: '2024-07-20',
        isUsed: false,
        restrictions: 'Valable uniquement en magasin'
      },
      {
        id: '2',
        code: 'GIFT50NEW',
        type: 'gift',
        value: 50,
        description: 'Bon cadeau client parrainage',
        issuedDate: '2024-01-18',
        expiryDate: '2024-12-31',
        isUsed: false
      }
    ];
    setVouchers(mockVouchers);
  };

  const loadLayawayOrders = async () => {
    const mockLayaway: LayawayOrder[] = [
      {
        id: '1',
        orderNumber: 'LAY-2024001',
        customerId: '1',
        customerName: 'Marie Martin',
        items: [
          { id: '1', name: 'iPhone 14 Pro 256Go', price: 1200, quantity: 1 },
          { id: '2', name: 'Coque protection', price: 25, quantity: 1 }
        ],
        totalAmount: 1225,
        paidAmount: 350,
        remainingAmount: 875,
        depositPercentage: 30,
        dueDate: '2024-02-15',
        status: 'active',
        createdAt: '2024-01-15',
        payments: [
          { id: '1', amount: 350, date: '2024-01-15', method: 'Carte bancaire' }
        ]
      }
    ];
    setLayawayOrders(mockLayaway);
  };

  const createPromotion = async (promotionData: Partial<Promotion>) => {
    const newPromotion: Promotion = {
      id: Date.now().toString(),
      name: promotionData.name || '',
      description: promotionData.description || '',
      type: promotionData.type || 'percentage',
      value: promotionData.value || 0,
      applicableItems: promotionData.applicableItems || [],
      customerSegment: promotionData.customerSegment || 'tous',
      minimumAmount: promotionData.minimumAmount,
      maximumDiscount: promotionData.maximumDiscount,
      startDate: promotionData.startDate || '',
      endDate: promotionData.endDate || '',
      isActive: true,
      usageCount: 0,
      usageLimit: promotionData.usageLimit,
      code: promotionData.code,
      autoApply: promotionData.autoApply || false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPromotions([...promotions, newPromotion]);
    setPromotionDialog(false);
    
    toast({
      title: "Promotion créée",
      description: `${newPromotion.name} a été créée avec succès`,
    });
  };

  const createVoucher = async (voucherData: Partial<Voucher>) => {
    const newVoucher: Voucher = {
      id: Date.now().toString(),
      code: voucherData.code || `VOUCHER${Date.now()}`,
      type: voucherData.type || 'discount',
      value: voucherData.value || 0,
      description: voucherData.description || '',
      issuedTo: voucherData.issuedTo,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: voucherData.expiryDate || '',
      isUsed: false,
      restrictions: voucherData.restrictions
    };

    setVouchers([...vouchers, newVoucher]);
    setVoucherDialog(false);
    
    toast({
      title: "Bon créé",
      description: `Bon ${newVoucher.code} créé avec succès`,
    });
  };

  const togglePromotionStatus = async (id: string) => {
    setPromotions(promotions.map(promo => 
      promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
    ));
    
    toast({
      title: "Statut modifié",
      description: "Le statut de la promotion a été mis à jour",
    });
  };

  const generateVoucherCode = () => {
    return `VOUCHER${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const getPromotionStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (now < startDate) {
      return <Badge variant="outline">Programmée</Badge>;
    }
    if (now > endDate) {
      return <Badge variant="destructive">Expirée</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'fixed': return <Euro className="h-4 w-4" />;
      case 'bogo': return <Gift className="h-4 w-4" />;
      case 'loyalty': return <Target className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const getVoucherTypeColor = (type: string) => {
    switch (type) {
      case 'credit': return 'bg-blue-100 text-blue-800';
      case 'gift': return 'bg-green-100 text-green-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getLayawayStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotions & Remises</h2>
          <p className="text-muted-foreground">
            Gestion des promotions, bons et ventes avec acomptes
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={promotionDialog} onOpenChange={setPromotionDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle Promotion</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle promotion ou remise
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createPromotion({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  type: formData.get('type') as any,
                  value: parseFloat(formData.get('value') as string),
                  customerSegment: formData.get('customerSegment') as string,
                  minimumAmount: formData.get('minimumAmount') ? parseFloat(formData.get('minimumAmount') as string) : undefined,
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                  code: formData.get('code') as string,
                  autoApply: formData.get('autoApply') === 'on',
                  usageLimit: formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : undefined,
                });
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom de la promotion</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de promotion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Pourcentage</SelectItem>
                        <SelectItem value="fixed">Montant fixe</SelectItem>
                        <SelectItem value="bogo">Acheté = Offert</SelectItem>
                        <SelectItem value="loyalty">Points fidélité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Valeur</Label>
                    <Input id="value" name="value" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="customerSegment">Segment client</Label>
                    <Select name="customerSegment" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Segment cible" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tous">Tous les clients</SelectItem>
                        <SelectItem value="nouveau">Nouveaux clients</SelectItem>
                        <SelectItem value="vip">Clients VIP</SelectItem>
                        <SelectItem value="fidele">Clients fidèles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minimumAmount">Montant minimum (€)</Label>
                    <Input id="minimumAmount" name="minimumAmount" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="usageLimit">Limite d'utilisation</Label>
                    <Input id="usageLimit" name="usageLimit" type="number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="code">Code promotionnel (optionnel)</Label>
                  <Input id="code" name="code" placeholder="Ex: REPAIR20" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="autoApply" name="autoApply" />
                  <Label htmlFor="autoApply">Application automatique</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setPromotionDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={voucherDialog} onOpenChange={setVoucherDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Gift className="mr-2 h-4 w-4" />
                Nouveau Bon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau Bon</DialogTitle>
                <DialogDescription>
                  Créer un bon de réduction ou avoir client
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createVoucher({
                  code: formData.get('code') as string || generateVoucherCode(),
                  type: formData.get('type') as any,
                  value: parseFloat(formData.get('value') as string),
                  description: formData.get('description') as string,
                  issuedTo: formData.get('issuedTo') as string,
                  expiryDate: formData.get('expiryDate') as string,
                  restrictions: formData.get('restrictions') as string,
                });
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Code du bon</Label>
                    <Input 
                      id="code" 
                      name="code" 
                      placeholder={generateVoucherCode()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de bon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Bon de réduction</SelectItem>
                        <SelectItem value="credit">Avoir client</SelectItem>
                        <SelectItem value="gift">Bon cadeau</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Valeur (€)</Label>
                    <Input id="value" name="value" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Date d'expiration</Label>
                    <Input id="expiryDate" name="expiryDate" type="date" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="issuedTo">Émis pour (optionnel)</Label>
                  <Input id="issuedTo" name="issuedTo" placeholder="Nom du client" />
                </div>
                <div>
                  <Label htmlFor="restrictions">Restrictions</Label>
                  <Textarea id="restrictions" name="restrictions" rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setVoucherDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="promotions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="promotions">
            <Percent className="mr-2 h-4 w-4" />
            Promotions ({promotions.length})
          </TabsTrigger>
          <TabsTrigger value="vouchers">
            <Gift className="mr-2 h-4 w-4" />
            Bons & Avoirs ({vouchers.length})
          </TabsTrigger>
          <TabsTrigger value="layaway">
            <Clock className="mr-2 h-4 w-4" />
            Ventes à Tempérament ({layawayOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Promotions Actives
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {promotions.filter(p => p.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  sur {promotions.length} total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisations Ce Mois
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15% vs mois dernier
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Économies Clients
                </CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€1,245</div>
                <p className="text-xs text-muted-foreground">
                  Ce mois-ci
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux de Conversion
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23%</div>
                <p className="text-xs text-muted-foreground">
                  +2% vs moyenne
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Promotions en Cours</CardTitle>
              <CardDescription>
                Gérez vos promotions et remises actives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promotion</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promotion.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {promotion.description}
                          </div>
                          {promotion.code && (
                            <Badge variant="outline" className="mt-1">
                              {promotion.code}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTypeIcon(promotion.type)}
                          <span className="ml-2 capitalize">{promotion.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promotion.type === 'percentage' 
                          ? `${promotion.value}%` 
                          : `€${promotion.value}`
                        }
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Du {promotion.startDate}</div>
                          <div>Au {promotion.endDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{promotion.usageCount}</div>
                          {promotion.usageLimit && (
                            <div className="text-muted-foreground">
                              / {promotion.usageLimit}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPromotionStatusBadge(promotion)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePromotionStatus(promotion.id)}
                          >
                            {promotion.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bons et Avoirs</CardTitle>
              <CardDescription>
                Gestion des bons de réduction et avoirs clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Émis pour</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <div className="font-mono text-sm">{voucher.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {voucher.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getVoucherTypeColor(voucher.type)}>
                          {voucher.type === 'credit' ? 'Avoir' : 
                           voucher.type === 'gift' ? 'Cadeau' : 'Réduction'}
                        </Badge>
                      </TableCell>
                      <TableCell>€{voucher.value.toFixed(2)}</TableCell>
                      <TableCell>{voucher.issuedTo || 'Général'}</TableCell>
                      <TableCell>{voucher.expiryDate}</TableCell>
                      <TableCell>
                        <Badge variant={voucher.isUsed ? 'secondary' : 'default'}>
                          {voucher.isUsed ? 'Utilisé' : 'Disponible'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layaway" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ventes à Tempérament</CardTitle>
              <CardDescription>
                Gestion des ventes avec acomptes et paiements échelonnés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant Total</TableHead>
                    <TableHead>Payé</TableHead>
                    <TableHead>Restant</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {layawayOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} article(s)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>€{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div>
                          <div>€{order.paidAmount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((order.paidAmount / order.totalAmount) * 100)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>€{order.remainingAmount.toFixed(2)}</TableCell>
                      <TableCell>{order.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={getLayawayStatusColor(order.status)}>
                          {order.status === 'active' ? 'En cours' :
                           order.status === 'completed' ? 'Terminé' :
                           order.status === 'overdue' ? 'En retard' : order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Euro className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromotionsManager;