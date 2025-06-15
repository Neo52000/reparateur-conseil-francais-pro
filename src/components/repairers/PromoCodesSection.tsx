
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  usage_limit?: number;
  usage_count: number;
  min_order_amount?: number;
  subscription_tier_filter?: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

const PromoCodesSection: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Formulaire pour nouveau code promo
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    usage_limit: '',
    min_order_amount: '',
    subscription_tier_filter: '',
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    // Simulation de données - à remplacer par l'appel Supabase réel
    const mockPromoCodes: PromoCode[] = [
      {
        id: '1',
        code: 'WELCOME20',
        description: 'Remise de bienvenue 20%',
        discount_type: 'percentage',
        discount_value: 20,
        usage_limit: 100,
        usage_count: 15,
        min_order_amount: 50,
        subscription_tier_filter: '',
        valid_from: '2024-01-01',
        valid_until: '2024-12-31',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        code: 'PREMIUM50',
        description: 'Réduction premium 50€',
        discount_type: 'fixed',
        discount_value: 50,
        usage_limit: 50,
        usage_count: 8,
        min_order_amount: 200,
        subscription_tier_filter: 'premium',
        valid_from: '2024-01-01',
        valid_until: '2024-06-30',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];
    setPromoCodes(mockPromoCodes);
  };

  const handleCreatePromoCode = async () => {
    setLoading(true);
    try {
      // Génération d'un ID unique pour la simulation
      const newPromoCode: PromoCode = {
        id: Date.now().toString(),
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
        usage_count: 0,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : undefined,
        subscription_tier_filter: formData.subscription_tier_filter || undefined,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        is_active: true,
        created_at: new Date().toISOString()
      };

      setPromoCodes(prev => [newPromoCode, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        usage_limit: '',
        min_order_amount: '',
        subscription_tier_filter: '',
        valid_from: '',
        valid_until: '',
      });

      toast({
        title: "Succès",
        description: "Code promo créé avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le code promo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    setPromoCodes(prev => 
      prev.map(promo => 
        promo.id === id ? { ...promo, is_active: !promo.is_active } : promo
      )
    );
    
    toast({
      title: "Succès",
      description: "Statut du code promo mis à jour"
    });
  };

  const handleDeletePromoCode = async (id: string) => {
    setPromoCodes(prev => prev.filter(promo => promo.id !== id));
    
    toast({
      title: "Succès",
      description: "Code promo supprimé avec succès"
    });
  };

  const formatDiscount = (type: 'percentage' | 'fixed', value: number) => {
    return type === 'percentage' ? `${value}%` : `${value}€`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Codes Promo</CardTitle>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un code promo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau code promo</DialogTitle>
              <DialogDescription>
                Configurez les critères et conditions du code promo
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code promo *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="ex: WELCOME20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du code promo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Type de remise</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData(prev => ({ ...prev, discount_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Valeur de la remise {formData.discount_type === 'percentage' ? '(%)' : '(€)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                  placeholder={formData.discount_type === 'percentage' ? '20' : '50'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite d'utilisation</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                  placeholder="ex: 100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_order_amount">Montant minimum (€)</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
                  placeholder="ex: 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription_tier_filter">Filtre par plan d'abonnement</Label>
                <Select
                  value={formData.subscription_tier_filter}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_tier_filter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les plans</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="basic">Basique</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_from">Valide à partir du</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valide jusqu'au</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreatePromoCode} disabled={loading || !formData.code}>
                Créer le code promo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Remise</TableHead>
              <TableHead>Utilisation</TableHead>
              <TableHead>Plan ciblé</TableHead>
              <TableHead>Validité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                <TableCell>{promo.description}</TableCell>
                <TableCell>{formatDiscount(promo.discount_type, promo.discount_value)}</TableCell>
                <TableCell>
                  {promo.usage_count}
                  {promo.usage_limit && ` / ${promo.usage_limit}`}
                </TableCell>
                <TableCell>
                  {promo.subscription_tier_filter ? (
                    <Badge variant="secondary">
                      {promo.subscription_tier_filter}
                    </Badge>
                  ) : (
                    'Tous'
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Du {new Date(promo.valid_from).toLocaleDateString()}</div>
                    <div>Au {new Date(promo.valid_until).toLocaleDateString()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={promo.is_active ? "default" : "secondary"}>
                    {promo.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleActive(promo.id)}>
                        {promo.is_active ? 'Désactiver' : 'Activer'}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeletePromoCode(promo.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {promoCodes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun code promo créé</p>
            <p className="text-sm text-gray-400 mt-2">
              Créez votre premier code promo pour encourager les abonnements
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromoCodesSection;
