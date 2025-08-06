import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Globe, Server, TrendingUp, Users, Zap, Shield, Search } from 'lucide-react';

interface CreateMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateMonitorDialog: React.FC<CreateMonitorDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET',
    timeout_seconds: 30,
    check_interval_minutes: 5,
    is_active: true,
    settings: {}
  });

  const monitorTypes = [
    {
      id: 'http',
      name: 'HTTP/HTTPS',
      description: 'Surveiller la disponibilité d\'un site web',
      icon: <Globe className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      description: 'Surveiller CPU, mémoire, disque',
      icon: <Server className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'business_metric',
      name: 'Métrique Business',
      description: 'CA, commandes, taux de conversion',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-purple-500',
      exclusive: true
    },
    {
      id: 'seo_rank',
      name: 'SEO Ranking',
      description: 'Position sur Google, mots-clés',
      icon: <Search className="h-5 w-5" />,
      color: 'bg-orange-500',
      exclusive: true
    },
    {
      id: 'client_satisfaction',
      name: 'Satisfaction Client',
      description: 'NPS, avis clients, support',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-pink-500',
      exclusive: true
    },
    {
      id: 'ssl',
      name: 'Certificat SSL',
      description: 'Expiration des certificats',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-yellow-500'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedType) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('monitors')
        .insert([
          {
            ...formData,
            type: selectedType,
            repairer_id: user.id
          }
        ]);

      if (error) throw error;

      toast.success('Monitor créé avec succès');
      onSuccess();
      
      // Reset form
      setFormData({
        name: '',
        url: '',
        method: 'GET',
        timeout_seconds: 30,
        check_interval_minutes: 5,
        is_active: true,
        settings: {}
      });
      setSelectedType('');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création du monitor');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'http':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL à surveiller *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://monsite.com"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Méthode HTTP</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'business_metric':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary">Exclusif TopReparateurs</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Surveillez vos KPIs business en temps réel avec des alertes intelligentes
              </p>
            </div>
            <div className="space-y-2">
              <Label>Type de métrique</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, settings: { ...prev.settings, metricType: value } }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une métrique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Chiffre d'affaires</SelectItem>
                  <SelectItem value="orders">Nombre de commandes</SelectItem>
                  <SelectItem value="conversion">Taux de conversion</SelectItem>
                  <SelectItem value="satisfaction">Satisfaction client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'seo_rank':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary">Exclusif TopReparateurs</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Suivez votre positionnement SEO et recevez des alertes de changement
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyword">Mot-clé à surveiller</Label>
              <Input
                id="keyword"
                placeholder="réparation smartphone paris"
                onChange={(e) => setFormData(prev => ({ ...prev, settings: { ...prev.settings, keyword: e.target.value } }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                placeholder="Paris, France"
                onChange={(e) => setFormData(prev => ({ ...prev, settings: { ...prev.settings, location: e.target.value } }))}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau monitor</DialogTitle>
          <DialogDescription>
            Choisissez le type de surveillance que vous souhaitez mettre en place
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du type */}
          {!selectedType && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Type de monitor</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monitorTypes.map((type) => (
                  <Card 
                    key={type.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color} text-white`}>
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {type.name}
                            {type.exclusive && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                Exclusif
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {type.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Configuration du monitor */}
          {selectedType && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className={`p-2 rounded-lg ${monitorTypes.find(t => t.id === selectedType)?.color} text-white`}>
                  {monitorTypes.find(t => t.id === selectedType)?.icon}
                </div>
                <div>
                  <h3 className="font-medium">{monitorTypes.find(t => t.id === selectedType)?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {monitorTypes.find(t => t.id === selectedType)?.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType('')}
                >
                  Changer
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du monitor *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Site web principal"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  {renderTypeSpecificFields()}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interval">Intervalle de vérification (minutes)</Label>
                    <Select 
                      value={formData.check_interval_minutes.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, check_interval_minutes: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 minute</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (secondes)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="5"
                      max="300"
                      value={formData.timeout_seconds}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Activer immédiatement</Label>
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading || !formData.name}>
                  {loading ? 'Création...' : 'Créer le monitor'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};