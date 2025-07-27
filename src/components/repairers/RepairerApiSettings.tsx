import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, CreditCard, Mail, AlertTriangle, Bot, Globe, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ApiSettings {
  stripe_secret_key?: string;
  resend_api_key?: string;
  firecrawl_api_key?: string;
  deepseek_api_key?: string;
  has_buyback_module: boolean;
  has_police_logbook: boolean;
  has_ai_enhancement: boolean;
  has_scraping_module: boolean;
}

export const RepairerApiSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ApiSettings>({
    has_buyback_module: false,
    has_police_logbook: false,
    has_ai_enhancement: false,
    has_scraping_module: false
  });
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('repairer_api_settings')
        .select('*')
        .eq('repairer_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading API settings:', error);
        toast.error('Erreur lors du chargement des paramètres');
        return;
      }

      if (data) {
        setSettings({
          stripe_secret_key: data.stripe_secret_key,
          resend_api_key: data.resend_api_key,
          firecrawl_api_key: (data as any).firecrawl_api_key,
          deepseek_api_key: (data as any).deepseek_api_key,
          has_buyback_module: data.has_buyback_module || false,
          has_police_logbook: data.has_police_logbook || false,
          has_ai_enhancement: (data as any).has_ai_enhancement || false,
          has_scraping_module: (data as any).has_scraping_module || false
        });
      }
    } catch (error) {
      console.error('Error loading API settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('repairer_api_settings')
        .upsert({
          repairer_id: user.id,
          ...settings
        });

      if (error) {
        console.error('Error saving API settings:', error);
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving API settings:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof ApiSettings>(key: K, value: ApiSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration des modules de rachat
          </CardTitle>
          <CardDescription>
            Activez et configurez les modules de rachat et livre de police dématérialisé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activation des modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="buyback-module" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Module de rachat
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activer le module de rachat d'appareils mobiles
                </p>
              </div>
              <Switch
                id="buyback-module"
                checked={settings.has_buyback_module}
                onCheckedChange={(checked) => updateSetting('has_buyback_module', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="police-logbook" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Livre de police dématérialisé
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activer le livre de police numérique
                </p>
              </div>
              <Switch
                id="police-logbook"
                checked={settings.has_police_logbook}
                onCheckedChange={(checked) => updateSetting('has_police_logbook', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="ai-enhancement" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Module IA
                </Label>
                <p className="text-sm text-muted-foreground">
                  Amélioration automatique des descriptions
                </p>
              </div>
              <Switch
                id="ai-enhancement"
                checked={settings.has_ai_enhancement}
                onCheckedChange={(checked) => updateSetting('has_ai_enhancement', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="scraping-module" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Module Scraping
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enrichissement automatique des données
                </p>
              </div>
              <Switch
                id="scraping-module"
                checked={settings.has_scraping_module}
                onCheckedChange={(checked) => updateSetting('has_scraping_module', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Configuration API */}
          {(settings.has_buyback_module || settings.has_police_logbook || settings.has_ai_enhancement || settings.has_scraping_module) && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Configuration des clés API</h3>
              
              {(settings.has_buyback_module || settings.has_police_logbook) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Conformité légale requise</p>
                      <p>Le module de rachat doit respecter la réglementation française sur l'achat d'objets d'occasion.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clés pour modules de paiement */}
                {(settings.has_buyback_module || settings.has_police_logbook) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Modules de paiement
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stripe-key">Clé secrète Stripe</Label>
                      <div className="relative">
                        <Input
                          id="stripe-key"
                          type={showApiKeys.stripe ? "text" : "password"}
                          placeholder="sk_test_..."
                          value={settings.stripe_secret_key || ''}
                          onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowApiKey('stripe')}
                        >
                          {showApiKeys.stripe ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nécessaire pour les paiements par carte bancaire
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resend-key">Clé API Resend</Label>
                      <div className="relative">
                        <Input
                          id="resend-key"
                          type={showApiKeys.resend ? "text" : "password"}
                          placeholder="re_..."
                          value={settings.resend_api_key || ''}
                          onChange={(e) => updateSetting('resend_api_key', e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowApiKey('resend')}
                        >
                          {showApiKeys.resend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nécessaire pour l'envoi d'emails de confirmation
                      </p>
                    </div>
                  </div>
                )}

                {/* Clés pour modules IA et Scraping */}
                {(settings.has_ai_enhancement || settings.has_scraping_module) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Modules d'enrichissement
                    </h4>
                    
                    {settings.has_scraping_module && (
                      <div className="space-y-2">
                        <Label htmlFor="firecrawl-key">Clé API Firecrawl</Label>
                        <div className="relative">
                          <Input
                            id="firecrawl-key"
                            type={showApiKeys.firecrawl ? "text" : "password"}
                            placeholder="fc-..."
                            value={settings.firecrawl_api_key || ''}
                            onChange={(e) => updateSetting('firecrawl_api_key', e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleShowApiKey('firecrawl')}
                          >
                            {showApiKeys.firecrawl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Nécessaire pour le scraping automatique de données
                        </p>
                      </div>
                    )}

                    {settings.has_ai_enhancement && (
                      <div className="space-y-2">
                        <Label htmlFor="deepseek-key">Clé API DeepSeek</Label>
                        <div className="relative">
                          <Input
                            id="deepseek-key"
                            type={showApiKeys.deepseek ? "text" : "password"}
                            placeholder="sk-..."
                            value={settings.deepseek_api_key || ''}
                            onChange={(e) => updateSetting('deepseek_api_key', e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleShowApiKey('deepseek')}
                          >
                            {showApiKeys.deepseek ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Nécessaire pour l'amélioration IA des descriptions
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Sécurité des clés API</p>
                    <p>Vos clés API sont chiffrées et stockées de manière sécurisée. Elles ne sont jamais affichées en clair après sauvegarde.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};