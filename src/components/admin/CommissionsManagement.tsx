import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, TrendingUp } from 'lucide-react';

interface CommissionTier {
  id: string;
  tier_name: string;
  min_monthly_revenue: number;
  max_monthly_revenue: number | null;
  commission_rate: number;
  description: string;
  is_active: boolean;
}

interface TransactionCommission {
  id: string;
  repairer_id: string;
  transaction_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  payment_date: string;
  tier_applied: {
    tier_name: string;
  };
}

export const CommissionsManagement: React.FC = () => {
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [commissions, setCommissions] = useState<TransactionCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<CommissionTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [tiersRes, commissionsRes] = await Promise.all([
        supabase.from('commission_tiers').select('*').order('min_monthly_revenue'),
        supabase
          .from('transaction_commissions')
          .select(`
            *,
            tier_applied:commission_tiers(tier_name)
          `)
          .order('payment_date', { ascending: false })
          .limit(50)
      ]);

      if (tiersRes.error) throw tiersRes.error;
      if (commissionsRes.error) throw commissionsRes.error;

      setTiers(tiersRes.data || []);
      setCommissions(commissionsRes.data as any || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTier = async (tierData: Partial<CommissionTier>) => {
    try {
      if (editingTier) {
        const { error } = await supabase
          .from('commission_tiers')
          .update(tierData as any)
          .eq('id', editingTier.id);
        
        if (error) throw error;
        
        toast({ title: "Succès", description: "Palier mis à jour" });
      } else {
        const { error } = await supabase
          .from('commission_tiers')
          .insert([tierData] as any);
        
        if (error) throw error;
        
        toast({ title: "Succès", description: "Palier créé" });
      }
      
      setIsDialogOpen(false);
      setEditingTier(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPending = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const totalPaid = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commission_amount, 0);

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Commissions</h2>
          <p className="text-muted-foreground">Paliers et transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTier(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Palier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTier ? 'Modifier le palier' : 'Créer un palier'}
              </DialogTitle>
            </DialogHeader>
            <TierForm 
              tier={editingTier} 
              onSave={handleSaveTier} 
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Commissions en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">
              {totalPending.toFixed(2)}€
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Commissions payées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {totalPaid.toFixed(2)}€
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total général</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(totalPending + totalPaid).toFixed(2)}€
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paliers de Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Palier</TableHead>
                <TableHead>CA Mensuel Min</TableHead>
                <TableHead>CA Mensuel Max</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-semibold">{tier.tier_name}</TableCell>
                  <TableCell>{tier.min_monthly_revenue}€</TableCell>
                  <TableCell>{tier.max_monthly_revenue ? `${tier.max_monthly_revenue}€` : '∞'}</TableCell>
                  <TableCell className="font-bold">{tier.commission_rate}%</TableCell>
                  <TableCell>
                    <Badge variant={tier.is_active ? "default" : "secondary"}>
                      {tier.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setEditingTier(tier);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dernières Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Montant Transaction</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Palier</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{new Date(commission.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>{commission.transaction_amount.toFixed(2)}€</TableCell>
                  <TableCell>{commission.commission_rate}%</TableCell>
                  <TableCell className="font-bold">{commission.commission_amount.toFixed(2)}€</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {commission.tier_applied?.tier_name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        commission.status === 'paid' ? 'default' : 
                        commission.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {commission.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const TierForm: React.FC<{
  tier: CommissionTier | null;
  onSave: (data: Partial<CommissionTier>) => void;
  onCancel: () => void;
}> = ({ tier, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    tier_name: tier?.tier_name || '',
    min_monthly_revenue: tier?.min_monthly_revenue || 0,
    max_monthly_revenue: tier?.max_monthly_revenue || null,
    commission_rate: tier?.commission_rate || 0,
    description: tier?.description || '',
    is_active: tier?.is_active ?? true
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Nom du palier</Label>
        <Input 
          value={formData.tier_name}
          onChange={(e) => setFormData({...formData, tier_name: e.target.value})}
          placeholder="Ex: Gold"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CA Min (€)</Label>
          <Input 
            type="number"
            value={formData.min_monthly_revenue}
            onChange={(e) => setFormData({...formData, min_monthly_revenue: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <Label>CA Max (€)</Label>
          <Input 
            type="number"
            value={formData.max_monthly_revenue || ''}
            onChange={(e) => setFormData({...formData, max_monthly_revenue: e.target.value ? parseFloat(e.target.value) : null})}
            placeholder="Laisser vide pour ∞"
          />
        </div>
      </div>
      
      <div>
        <Label>Taux de commission (%)</Label>
        <Input 
          type="number"
          step="0.01"
          value={formData.commission_rate}
          onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Input 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={() => onSave(formData)}>Enregistrer</Button>
      </div>
    </div>
  );
};
