import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, CreditCard, Banknote, Smartphone, Trash2, Settings, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'cash' | 'mobile' | 'other';
  enabled: boolean;
  icon?: string;
  config?: {
    fees?: number;
    feeType?: 'fixed' | 'percentage';
    minAmount?: number;
    maxAmount?: number;
    acceptedCards?: string[];
  };
}

interface PaymentMethodsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMethods: Record<string, boolean>;
  onSave: (methods: Record<string, any>) => void;
}

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  open,
  onOpenChange,
  currentMethods,
  onSave
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: 'cash',
      name: 'Espèces',
      type: 'cash',
      enabled: currentMethods.cash || false,
      config: { minAmount: 0, maxAmount: 500 }
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      type: 'card',
      enabled: currentMethods.card || false,
      config: { 
        fees: 2.5, 
        feeType: 'percentage',
        acceptedCards: ['Visa', 'Mastercard', 'American Express']
      }
    },
    {
      id: 'mobile',
      name: 'Paiement mobile',
      type: 'mobile',
      enabled: currentMethods.mobile || false,
      config: { fees: 1.5, feeType: 'percentage' }
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [newMethod, setNewMethod] = useState({
    name: '',
    type: 'other' as const,
    fees: 0,
    feeType: 'percentage' as const,
    minAmount: 0,
    maxAmount: 0
  });

  const { toast } = useToast();

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const toggleMethod = (id: string) => {
    setMethods(methods.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  const addMethod = () => {
    if (!newMethod.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour le moyen de paiement",
        variant: "destructive"
      });
      return;
    }

    const method: PaymentMethod = {
      id: `custom_${Date.now()}`,
      name: newMethod.name,
      type: newMethod.type,
      enabled: true,
      config: {
        fees: newMethod.fees,
        feeType: newMethod.feeType,
        minAmount: newMethod.minAmount,
        maxAmount: newMethod.maxAmount || undefined
      }
    };

    setMethods([...methods, method]);
    setNewMethod({ name: '', type: 'other', fees: 0, feeType: 'percentage', minAmount: 0, maxAmount: 0 });
    setShowAddForm(false);
    
    toast({
      title: "Moyen de paiement ajouté",
      description: `${method.name} a été ajouté avec succès.`
    });
  };

  const deleteMethod = (id: string) => {
    if (['cash', 'card', 'mobile'].includes(id)) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les moyens de paiement par défaut",
        variant: "destructive"
      });
      return;
    }

    setMethods(methods.filter(method => method.id !== id));
    toast({
      title: "Moyen de paiement supprimé",
      description: "Le moyen de paiement a été supprimé avec succès."
    });
  };

  const updateMethodConfig = (id: string, config: any) => {
    setMethods(methods.map(method => 
      method.id === id ? { ...method, config: { ...method.config, ...config } } : method
    ));
  };

  const handleSave = () => {
    const enabledMethods = methods.reduce((acc, method) => {
      acc[method.id] = method.enabled;
      return acc;
    }, {} as Record<string, boolean>);

    const methodsConfig = methods.reduce((acc, method) => {
      if (method.config) {
        acc[`${method.id}_config`] = method.config;
      }
      return acc;
    }, {} as Record<string, any>);

    onSave({ ...enabledMethods, ...methodsConfig });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Gestion des moyens de paiement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Liste des moyens de paiement existants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Moyens de paiement configurés</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {methods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(method.type)}
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <Badge variant={method.enabled ? "default" : "secondary"}>
                        {method.enabled ? "Activé" : "Désactivé"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => toggleMethod(method.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMethod(method)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      {!['cash', 'card', 'mobile'].includes(method.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMethod(method.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Configuration rapide */}
                  {method.config && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {method.config.fees && (
                          <div>
                            <p className="text-muted-foreground">Frais</p>
                            <p className="font-medium">
                              {method.config.fees}
                              {method.config.feeType === 'percentage' ? '%' : '€'}
                            </p>
                          </div>
                        )}
                        {method.config.minAmount !== undefined && (
                          <div>
                            <p className="text-muted-foreground">Montant min.</p>
                            <p className="font-medium">{method.config.minAmount}€</p>
                          </div>
                        )}
                        {method.config.maxAmount && (
                          <div>
                            <p className="text-muted-foreground">Montant max.</p>
                            <p className="font-medium">{method.config.maxAmount}€</p>
                          </div>
                        )}
                        {method.config.acceptedCards && (
                          <div>
                            <p className="text-muted-foreground">Cartes acceptées</p>
                            <p className="font-medium">{method.config.acceptedCards.length} types</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un moyen de paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="method-name">Nom du moyen de paiement</Label>
                    <Input
                      id="method-name"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                      placeholder="Ex: Chèque, Virement..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method-type">Type</Label>
                    <select 
                      id="method-type"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newMethod.type}
                      onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value as any })}
                    >
                      <option value="other">Autre</option>
                      <option value="card">Carte</option>
                      <option value="mobile">Mobile</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="method-fees">Frais</Label>
                    <Input
                      id="method-fees"
                      type="number"
                      step="0.01"
                      value={newMethod.fees}
                      onChange={(e) => setNewMethod({ ...newMethod, fees: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method-fee-type">Type de frais</Label>
                    <select 
                      id="method-fee-type"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newMethod.feeType}
                      onChange={(e) => setNewMethod({ ...newMethod, feeType: e.target.value as any })}
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Fixe (€)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method-min">Montant minimum (€)</Label>
                    <Input
                      id="method-min"
                      type="number"
                      step="0.01"
                      value={newMethod.minAmount}
                      onChange={(e) => setNewMethod({ ...newMethod, minAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Annuler
                  </Button>
                  <Button onClick={addMethod}>
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résumé */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Total configurés</p>
                  <p className="text-2xl font-bold text-primary">{methods.length}</p>
                </div>
                <div>
                  <p className="font-medium">Activés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {methods.filter(m => m.enabled).length}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Avec frais</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {methods.filter(m => m.config?.fees && m.config.fees > 0).length}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Personnalisés</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {methods.filter(m => !['cash', 'card', 'mobile'].includes(m.id)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder les modifications
            </Button>
          </div>
        </div>

        {/* Modal de configuration détaillée */}
        {editingMethod && (
          <Dialog open={!!editingMethod} onOpenChange={() => setEditingMethod(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuration de {editingMethod.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {editingMethod.type === 'card' && editingMethod.config?.acceptedCards && (
                  <div className="space-y-2">
                    <Label>Cartes acceptées</Label>
                    <div className="space-y-2">
                      {['Visa', 'Mastercard', 'American Express', 'Diners'].map(card => (
                        <div key={card} className="flex items-center space-x-2">
                          <input 
                            type="checkbox"
                            checked={editingMethod.config?.acceptedCards?.includes(card)}
                            onChange={(e) => {
                              const current = editingMethod.config?.acceptedCards || [];
                              const updated = e.target.checked 
                                ? [...current, card]
                                : current.filter(c => c !== card);
                              updateMethodConfig(editingMethod.id, { acceptedCards: updated });
                              setEditingMethod({ ...editingMethod, config: { ...editingMethod.config, acceptedCards: updated } });
                            }}
                          />
                          <Label>{card}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Montant minimum (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingMethod.config?.minAmount || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        updateMethodConfig(editingMethod.id, { minAmount: value });
                        setEditingMethod({ 
                          ...editingMethod, 
                          config: { ...editingMethod.config, minAmount: value } 
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Montant maximum (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingMethod.config?.maxAmount || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || undefined;
                        updateMethodConfig(editingMethod.id, { maxAmount: value });
                        setEditingMethod({ 
                          ...editingMethod, 
                          config: { ...editingMethod.config, maxAmount: value } 
                        });
                      }}
                      placeholder="Illimité"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingMethod(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodsModal;