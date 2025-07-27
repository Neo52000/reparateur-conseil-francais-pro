import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Star, 
  Plus, 
  Gift, 
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { useBusinessModules } from '@/hooks/useBusinessModules';

const LoyaltyProgramManager: React.FC = () => {
  const { 
    loyaltyProgram, 
    loyaltyCustomers, 
    loyaltyTransactions,
    createLoyaltyProgram,
    addPointsToCustomer,
    redeemPoints,
    getLoyaltyStats,
    loading
  } = useBusinessModules();

  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  
  const [programForm, setProgramForm] = useState({
    program_name: 'Programme Fidélité',
    points_per_euro: 1.0,
    welcome_bonus: 50
  });

  const [pointsForm, setPointsForm] = useState({
    customer_email: '',
    customer_name: '',
    points: 0,
    description: ''
  });

  const [redeemForm, setRedeemForm] = useState({
    points: 0,
    description: ''
  });

  const stats = getLoyaltyStats();

  const handleCreateProgram = async () => {
    await createLoyaltyProgram(programForm);
    setIsCreateProgramOpen(false);
  };

  const handleAddPoints = async () => {
    await addPointsToCustomer(
      pointsForm.customer_email,
      pointsForm.customer_name,
      pointsForm.points,
      pointsForm.description
    );
    setIsAddPointsOpen(false);
    setPointsForm({ customer_email: '', customer_name: '', points: 0, description: '' });
  };

  const handleRedeem = async () => {
    await redeemPoints(selectedCustomer, redeemForm.points, redeemForm.description);
    setIsRedeemOpen(false);
    setRedeemForm({ points: 0, description: '' });
    setSelectedCustomer('');
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  if (!loyaltyProgram) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Programme de Fidélité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Aucun programme de fidélité configuré. Créez-en un pour commencer.
          </p>
          <Dialog open={isCreateProgramOpen} onOpenChange={setIsCreateProgramOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un programme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un programme de fidélité</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="program_name">Nom du programme</Label>
                  <Input
                    id="program_name"
                    value={programForm.program_name}
                    onChange={(e) => setProgramForm({...programForm, program_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="points_per_euro">Points par euro dépensé</Label>
                  <Input
                    id="points_per_euro"
                    type="number"
                    step="0.1"
                    value={programForm.points_per_euro}
                    onChange={(e) => setProgramForm({...programForm, points_per_euro: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="welcome_bonus">Bonus de bienvenue</Label>
                  <Input
                    id="welcome_bonus"
                    type="number"
                    value={programForm.welcome_bonus}
                    onChange={(e) => setProgramForm({...programForm, welcome_bonus: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateProgram} className="flex-1">
                    Créer
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateProgramOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clients actifs</p>
              <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Star className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Points distribués</p>
              <p className="text-2xl font-bold">{stats.totalPointsDistributed.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Gift className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taux de rachat</p>
              <p className="text-2xl font-bold">{stats.redemptionRate}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Moyenne par client</p>
              <p className="text-2xl font-bold">{stats.averagePointsPerCustomer}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter des points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter des points à un client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_email">Email du client</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={pointsForm.customer_email}
                  onChange={(e) => setPointsForm({...pointsForm, customer_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="customer_name">Nom du client</Label>
                <Input
                  id="customer_name"
                  value={pointsForm.customer_name}
                  onChange={(e) => setPointsForm({...pointsForm, customer_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="points">Nombre de points</Label>
                <Input
                  id="points"
                  type="number"
                  value={pointsForm.points}
                  onChange={(e) => setPointsForm({...pointsForm, points: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={pointsForm.description}
                  onChange={(e) => setPointsForm({...pointsForm, description: e.target.value})}
                  placeholder="Raison de l'attribution..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddPoints} className="flex-1">
                  Ajouter
                </Button>
                <Button variant="outline" onClick={() => setIsAddPointsOpen(false)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Clients fidélité</CardTitle>
        </CardHeader>
        <CardContent>
          {loyaltyCustomers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun client fidélité pour le moment.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Points actuels</TableHead>
                  <TableHead>Points totaux</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loyaltyCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{customer.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.total_points} pts
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.lifetime_points.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={customer.tier_level === 'gold' ? 'default' : 'secondary'}>
                        {customer.tier_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isRedeemOpen && selectedCustomer === customer.id} onOpenChange={(open) => {
                        setIsRedeemOpen(open);
                        if (!open) setSelectedCustomer('');
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCustomer(customer.id)}
                          >
                            <Gift className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Échanger des points - {customer.customer_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Points disponibles: {customer.total_points}
                            </p>
                            <div>
                              <Label htmlFor="redeem_points">Nombre de points à échanger</Label>
                              <Input
                                id="redeem_points"
                                type="number"
                                max={customer.total_points}
                                value={redeemForm.points}
                                onChange={(e) => setRedeemForm({...redeemForm, points: parseInt(e.target.value)})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="redeem_description">Description</Label>
                              <Textarea
                                id="redeem_description"
                                value={redeemForm.description}
                                onChange={(e) => setRedeemForm({...redeemForm, description: e.target.value})}
                                placeholder="Contrepartie de l'échange..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleRedeem} className="flex-1">
                                Échanger
                              </Button>
                              <Button variant="outline" onClick={() => setIsRedeemOpen(false)} className="flex-1">
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loyaltyTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune transaction pour le moment.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loyaltyTransactions.slice(0, 10).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.transaction_type === 'earned' ? 'default' : 'secondary'}>
                        {transaction.transaction_type === 'earned' ? 'Gagné' : 'Échangé'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={transaction.points_amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.points_amount > 0 ? '+' : ''}{transaction.points_amount}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
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

export default LoyaltyProgramManager;