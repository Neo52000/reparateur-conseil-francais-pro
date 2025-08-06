
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminAuditIntegration } from '@/hooks/useAdminAuditIntegration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Edit, Copy } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  current_uses: number;
  valid_until?: string;
  active: boolean;
  applicable_plans: string[];
  created_at: string;
}

const PromoCodesManagement: React.FC = () => {
  const { logPromoCodeAction } = useAdminAuditIntegration();
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_uses: '',
    valid_until: '',
    applicable_plans: [] as string[]
  });

  const generatePromoCode = () => {
    const code = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newPromoCode: PromoCode = {
        id: crypto.randomUUID(),
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        current_uses: 0,
        valid_until: formData.valid_until || undefined,
        active: true,
        applicable_plans: formData.applicable_plans,
        created_at: new Date().toISOString()
      };

      // Create promo code via Supabase
      const { error } = await supabase
        .from('promo_codes')
        .insert([newPromoCode]);

      if (error) throw error;
      
      logPromoCodeAction('create', newPromoCode.id, {
        code: newPromoCode.code,
        discount_type: newPromoCode.discount_type,
        discount_value: newPromoCode.discount_value,
        max_uses: newPromoCode.max_uses,
        valid_until: newPromoCode.valid_until,
        applicable_plans: newPromoCode.applicable_plans
      }, 'info');

      setPromoCodes(prev => [newPromoCode, ...prev]);
      
      // Reset form
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        max_uses: '',
        valid_until: '',
        applicable_plans: []
      });

      toast({
        title: "Code promo créé",
        description: `Le code ${newPromoCode.code} a été créé avec succès`,
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

  const handleDeletePromoCode = async (promoCode: PromoCode) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le code ${promoCode.code} ?`)) {
      return;
    }

    try {
      // Delete promo code via Supabase
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', promoCode.id);

      if (error) throw error;
      
      logPromoCodeAction('delete', promoCode.id, {
        code: promoCode.code,
        discount_type: promoCode.discount_type,
        discount_value: promoCode.discount_value,
        deletion_reason: 'Manual admin deletion',
        usage_stats: {
          current_uses: promoCode.current_uses,
          max_uses: promoCode.max_uses
        }
      }, 'warning');

      setPromoCodes(prev => prev.filter(pc => pc.id !== promoCode.id));

      toast({
        title: "Code promo supprimé",
        description: `Le code ${promoCode.code} a été supprimé`,
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le code promo",
        variant: "destructive"
      });
    }
  };

  const handleTogglePromoCode = async (promoCode: PromoCode) => {
    try {
      // Update promo code status via Supabase
      const newStatus = !promoCode.active;
      const { error } = await supabase
        .from('promo_codes')
        .update({ active: newStatus })
        .eq('id', promoCode.id);

      if (error) throw error;
      
      const action = newStatus ? 'activate' : 'deactivate';
      
      logPromoCodeAction(action, promoCode.id, {
        code: promoCode.code,
        previous_status: promoCode.active ? 'active' : 'inactive',
        new_status: newStatus ? 'active' : 'inactive',
        toggle_reason: 'Manual admin toggle'
      }, 'info');

      setPromoCodes(prev => 
        prev.map(pc => 
          pc.id === promoCode.id 
            ? { ...pc, active: newStatus }
            : pc
        )
      );

      toast({
        title: newStatus ? "Code promo activé" : "Code promo désactivé",
        description: `Le code ${promoCode.code} a été ${newStatus ? 'activé' : 'désactivé'}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du code promo",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copié",
      description: `Le code ${code} a été copié dans le presse-papiers`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau code promo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePromoCode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code promo</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="EXEMPLE2024"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generatePromoCode}>
                    Générer
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Type de remise</Label>
                <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => 
                  setFormData(prev => ({ ...prev, discount_type: value }))
                }>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                  placeholder={formData.discount_type === 'percentage' ? '20' : '10.00'}
                  min="0"
                  step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Nombre d'utilisations max (optionnel)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                  placeholder="100"
                  min="1"
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
            </div>

            <Button type="submit" disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              {loading ? 'Création...' : 'Créer le code promo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Codes promo existants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Remise</TableHead>
                <TableHead>Utilisations</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promoCode) => (
                <TableRow key={promoCode.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {promoCode.code}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(promoCode.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promoCode.discount_type === 'percentage' 
                      ? `${promoCode.discount_value}%` 
                      : `${promoCode.discount_value}€`
                    }
                  </TableCell>
                  <TableCell>
                    {promoCode.current_uses}/{promoCode.max_uses || '∞'}
                  </TableCell>
                  <TableCell>
                    {promoCode.valid_until 
                      ? new Date(promoCode.valid_until).toLocaleDateString('fr-FR')
                      : 'Aucune'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={promoCode.active ? 'default' : 'secondary'}>
                      {promoCode.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePromoCode(promoCode)}
                      >
                        {promoCode.active ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePromoCode(promoCode)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {promoCodes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucun code promo créé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoCodesManagement;
