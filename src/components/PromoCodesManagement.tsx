import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Copy, Eye, EyeOff } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_months';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  applicable_plans: string[];
  created_at: string;
}

const PromoCodesManagement = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_months',
    discount_value: '',
    max_uses: '',
    valid_until: '',
    applicable_plans: [] as string[]
  });

  const planOptions = ['gratuit', 'basique', 'premium', 'enterprise'];

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion pour s'assurer que discount_type correspond à nos types attendus
      const typedData = (data || []).map(item => ({
        ...item,
        discount_type: item.discount_type as 'percentage' | 'fixed_amount' | 'free_months',
        applicable_plans: item.applicable_plans || []
      })) as PromoCode[];
      
      setPromoCodes(typedData);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les codes promo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      max_uses: '',
      valid_until: '',
      applicable_plans: []
    });
    setEditingCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until || null,
        applicable_plans: formData.applicable_plans
      };

      if (editingCode) {
        const { error } = await supabase
          .from('promo_codes')
          .update(payload)
          .eq('id', editingCode.id);
        
        if (error) throw error;
        toast({
          title: "Succès",
          description: "Code promo mis à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert(payload);
        
        if (error) throw error;
        toast({
          title: "Succès",
          description: "Code promo créé avec succès"
        });
      }

      fetchPromoCodes();
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving promo code:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
      
      fetchPromoCodes();
      toast({
        title: "Succès",
        description: `Code promo ${active ? 'activé' : 'désactivé'}`
      });
    } catch (error) {
      console.error('Error toggling promo code:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification",
        variant: "destructive"
      });
    }
  };

  const deletePromoCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchPromoCodes();
      toast({
        title: "Succès",
        description: "Code promo supprimé"
      });
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copié",
      description: "Code copié dans le presse-papiers"
    });
  };

  const editPromoCode = (promoCode: PromoCode) => {
    setFormData({
      code: promoCode.code,
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value.toString(),
      max_uses: promoCode.max_uses?.toString() || '',
      valid_until: promoCode.valid_until ? promoCode.valid_until.split('T')[0] : '',
      applicable_plans: promoCode.applicable_plans || []
    });
    setEditingCode(promoCode);
    setShowCreateDialog(true);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const getDiscountLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Pourcentage';
      case 'fixed_amount':
        return 'Montant fixe';
      case 'free_months':
        return 'Mois gratuit';
      default:
        return type;
    }
  };

  const getDiscountDisplay = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed_amount':
        return `${value}€`;
      case 'free_months':
        return `${value} mois`;
      default:
        return `${value}`;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Codes Promo</h2>
          <p className="text-gray-600">Gérez les codes de réduction pour les abonnements</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un code promo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Modifier le code promo' : 'Créer un code promo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code promo</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="PROMO2024"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Générer
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Type de réduction</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={(value: 'percentage' | 'fixed_amount' | 'free_months') => 
                    setFormData(prev => ({ ...prev, discount_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                    <SelectItem value="free_months">Mois gratuit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Valeur {formData.discount_type === 'percentage' ? '(%)' : 
                           formData.discount_type === 'fixed_amount' ? '(€)' : 
                           formData.discount_type === 'free_months' ? '(mois)' : ''}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Nombre d'utilisations max (optionnel)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                  placeholder="Illimité si vide"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Date d'expiration (optionnel)</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Plans applicables (tous si aucun sélectionné)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {planOptions.map((plan) => (
                    <label key={plan} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.applicable_plans.includes(plan)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              applicable_plans: [...prev.applicable_plans, plan]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              applicable_plans: prev.applicable_plans.filter(p => p !== plan)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCode ? 'Modifier' : 'Créer'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des codes promo</CardTitle>
        </CardHeader>
        <CardContent>
          {promoCodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun code promo créé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Réduction</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Plans</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {promo.code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(promo.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDiscountDisplay(promo.discount_type, promo.discount_value)}
                    </TableCell>
                    <TableCell>
                      {promo.current_uses} / {promo.max_uses || '∞'}
                    </TableCell>
                    <TableCell>
                      {promo.applicable_plans.length === 0 ? (
                        <Badge variant="secondary">Tous</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {promo.applicable_plans.map((plan) => (
                            <Badge key={plan} variant="outline" className="text-xs">
                              {plan}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={promo.active}
                          onCheckedChange={(checked) => toggleActive(promo.id, checked)}
                        />
                        <Badge variant={promo.active ? "default" : "secondary"}>
                          {promo.active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.valid_until 
                        ? new Date(promo.valid_until).toLocaleDateString()
                        : 'Aucune'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editPromoCode(promo)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePromoCode(promo.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoCodesManagement;
