import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import {
  Settings,
  ExternalLink,
  DollarSign,
  Percent,
  CalendarDays,
  AlertCircle
} from 'lucide-react';

const cssProviders = [
  { 
    value: 'css-partner-pro', 
    label: 'CSS Partner Pro', 
    savings: '15-20%',
    description: 'Partenaire officiel Google avec expertise e-commerce'
  },
  { 
    value: 'shopping-css', 
    label: 'Shopping CSS', 
    savings: '10-18%',
    description: 'Spécialisé dans les petites et moyennes entreprises'
  },
  { 
    value: 'ads-optimizer', 
    label: 'Ads Optimizer', 
    savings: '12-22%',
    description: 'Solution premium avec support dédié'
  }
];

interface CSSData {
  is_active: boolean;
  css_provider: string;
  css_account_id: string;
  savings_percentage: number;
  total_savings: number;
  monthly_savings: number;
  activation_date: string;
}

export const GoogleCSSManager = () => {
  const [cssData, setCssData] = useState<CSSData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('css-partner-pro');
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCSSData();
  }, []);

  const loadCSSData = async () => {
    try {
      // Configuration CSS Google Shopping pas encore implémentée en base
      console.log('CSS configuration will be implemented later');
    } catch (error) {
      console.log('CSS configuration not yet implemented in database');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Google CSS Manager</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre configuration CSS Google Shopping pour réduire vos coûts publicitaires
        </p>
      </div>

      {/* Configuration non disponible en production */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          La gestion CSS Google Shopping sera disponible prochainement. 
          Cette fonctionnalité permettra de réduire vos coûts publicitaires de 10 à 20%.
        </AlertDescription>
      </Alert>

      {/* Configuration CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration CSS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="css-active">Activer Google CSS</Label>
              <p className="text-sm text-muted-foreground">
                Réduisez vos coûts Google Shopping avec un partenaire CSS
              </p>
            </div>
            <Switch
              id="css-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={true} // Désactivé en production
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="css-provider">Fournisseur CSS</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider} disabled={true}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {cssProviders.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex flex-col">
                        <span>{provider.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {provider.description} • Économies: {provider.savings}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account-id">ID Compte CSS</Label>
              <Input
                id="account-id"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="CSS-123456789"
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques d'économies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Économies totales</p>
                <p className="text-2xl font-bold text-foreground">€0.00</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">% d'économies</p>
                <p className="text-2xl font-bold text-foreground">0.0%</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Percent className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ce mois-ci</p>
                <p className="text-2xl font-bold text-foreground">€0.00</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button disabled={true}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Configurer Google Ads
        </Button>
        <Button variant="outline" disabled={true}>
          Tester la configuration
        </Button>
      </div>
    </div>
  );
};