import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdvertisingCampaignService } from '@/services/advertising/AdvertisingCampaignService';

const platforms = [
  { id: 'google_ads', name: 'Google Ads', color: 'bg-blue-500' },
  { id: 'meta_ads', name: 'Meta Ads', color: 'bg-blue-600' },
  { id: 'microsoft_ads', name: 'Microsoft Advertising', color: 'bg-orange-500' },
  { id: 'google_shopping', name: 'Google Shopping', color: 'bg-green-500' },
  { id: 'bing_shopping', name: 'Bing Shopping', color: 'bg-orange-600' },
  { id: 'instagram_ads', name: 'Instagram Ads', color: 'bg-pink-500' }
];

const creativeStyles = [
  { value: 'proximite', label: 'Proximité', description: 'Chaleureux et local' },
  { value: 'technique', label: 'Technique', description: 'Expertise et précision' },
  { value: 'urgence', label: 'Urgence', description: 'Rapide et efficace' },
  { value: 'humour', label: 'Humour', description: 'Léger et sympathique' },
  { value: 'premium', label: 'Premium', description: 'Haut de gamme et qualité' }
];

const campaignTypes = [
  { value: 'automated', label: 'Automatisée', description: 'IA gère tout automatiquement' },
  { value: 'manual', label: 'Manuelle', description: 'Contrôle total de vos paramètres' },
  { value: 'boost', label: 'Boost', description: 'Amplification rapide d\'une campagne' }
];

interface NewCampaignDialogProps {
  trigger?: React.ReactNode;
  onCampaignCreated?: () => void;
}

export const NewCampaignDialog = ({ trigger, onCampaignCreated }: NewCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'automated' as 'automated' | 'manual' | 'boost',
    budget_total: 500,
    budget_daily: 50,
    channels: [] as string[],
    creative_style: 'proximite' as 'technique' | 'proximite' | 'urgence' | 'humour' | 'premium',
    auto_optimization: true,
    targeting_config: {
      location_radius: 10,
      keywords: '',
      demographics: {
        age_range: '25-55'
      }
    }
  });

  const handleChannelToggle = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la campagne est obligatoire",
        variant: "destructive"
      });
      return;
    }

    if (formData.channels.length === 0) {
      toast({
        title: "Erreur", 
        description: "Sélectionnez au moins une plateforme publicitaire",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const keywords = formData.targeting_config.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      await AdvertisingCampaignService.createCampaign({
        ...formData,
        targeting_config: {
          ...formData.targeting_config,
          keywords
        }
      });

      toast({
        title: "Succès",
        description: "Campagne créée avec succès"
      });

      setOpen(false);
      onCampaignCreated?.();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        campaign_type: 'automated',
        budget_total: 500,
        budget_daily: 50,
        channels: [],
        creative_style: 'proximite',
        auto_optimization: true,
        targeting_config: {
          location_radius: 10,
          keywords: '',
          demographics: {
            age_range: '25-55'
          }
        }
      });
    } catch (error) {
      console.error('Erreur création campagne:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la campagne",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle campagne
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Créer une nouvelle campagne
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la campagne</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Réparation iPhone - Proximité"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de campagne</Label>
                  <Select 
                    value={formData.campaign_type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, campaign_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre campagne..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                Budget et planification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_total">Budget total (€)</Label>
                  <Input
                    id="budget_total"
                    type="number"
                    value={formData.budget_total}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_total: Number(e.target.value) }))}
                    min="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_daily">Budget quotidien (€)</Label>
                  <Input
                    id="budget_daily"
                    type="number"
                    value={formData.budget_daily}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_daily: Number(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plateformes */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Plateformes publicitaires</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      formData.channels.includes(platform.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => handleChannelToggle(platform.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={formData.channels.includes(platform.id)}
                        onChange={() => {}}
                      />
                      <div className={`w-3 h-3 rounded ${platform.color}`} />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Style créatif */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Style créatif IA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {creativeStyles.map((style) => (
                  <div
                    key={style.value}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      formData.creative_style === style.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, creative_style: style.value as any }))}
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{style.label}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ciblage */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Ciblage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="radius">Rayon géographique (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.targeting_config.location_radius}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      targeting_config: { 
                        ...prev.targeting_config, 
                        location_radius: Number(e.target.value) 
                      }
                    }))}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_range">Tranche d'âge</Label>
                  <Select 
                    value={formData.targeting_config.demographics.age_range}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      targeting_config: { 
                        ...prev.targeting_config, 
                        demographics: { ...prev.targeting_config.demographics, age_range: value }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24 ans</SelectItem>
                      <SelectItem value="25-34">25-34 ans</SelectItem>
                      <SelectItem value="25-55">25-55 ans</SelectItem>
                      <SelectItem value="35-44">35-44 ans</SelectItem>
                      <SelectItem value="45-54">45-54 ans</SelectItem>
                      <SelectItem value="55+">55+ ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Mots-clés (séparés par des virgules)</Label>
                <Textarea
                  id="keywords"
                  value={formData.targeting_config.keywords}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    targeting_config: { 
                      ...prev.targeting_config, 
                      keywords: e.target.value 
                    }
                  }))}
                  placeholder="réparation iphone, smartphone cassé, écran fissuré..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Options avancées */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto_optimization"
                  checked={formData.auto_optimization}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_optimization: checked as boolean }))}
                />
                <Label htmlFor="auto_optimization" className="text-sm">
                  Optimisation automatique par IA
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                L'IA ajustera automatiquement les enchères, le ciblage et les créations pour maximiser les performances.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer la campagne'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};