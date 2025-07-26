import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Euro, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ExternalLink,
  DollarSign,
  Percent,
  CalendarDays
} from 'lucide-react';

const mockCSSData = {
  is_active: true,
  css_provider: 'CSS Partner Pro',
  css_account_id: 'CSS-789456123',
  savings_percentage: 18.5,
  total_savings: 1240.50,
  monthly_savings: 320.15,
  activation_date: '2024-01-01T00:00:00Z'
};

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

export const GoogleCSSManager = () => {
  const [isActive, setIsActive] = useState(mockCSSData.is_active);
  const [selectedProvider, setSelectedProvider] = useState('css-partner-pro');
  const [accountId, setAccountId] = useState(mockCSSData.css_account_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Google CSS Manager</h2>
        <p className="text-muted-foreground">
          Économisez jusqu'à 20% sur vos enchères Google Shopping avec un partenaire CSS
        </p>
      </div>

      {/* Status et économies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut CSS</p>
                <div className="flex items-center gap-2 mt-1">
                  {isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">Actif</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold text-red-600">Inactif</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Économies totales</p>
                <p className="text-2xl font-bold text-foreground">
                  €{mockCSSData.total_savings.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Euro className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">Depuis activation</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">% d'économies</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockCSSData.savings_percentage.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-muted-foreground">Sur les enchères</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ce mois-ci</p>
                <p className="text-2xl font-bold text-foreground">
                  €{mockCSSData.monthly_savings.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+12% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration CSS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Configuration CSS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Service CSS actif</p>
                <p className="text-sm text-muted-foreground">
                  Économisez sur vos enchères Google Shopping
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {isActive && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fournisseur CSS</label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cssProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div>
                            <div className="font-medium">{provider.label}</div>
                            <div className="text-xs text-muted-foreground">
                              Économies: {provider.savings}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ID Compte CSS</label>
                  <Input
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="CSS-123456789"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Identifiant fourni par votre partenaire CSS
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">
                    Sauvegarder la configuration
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qu'est-ce que Google CSS ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 mb-2">
                    Comparison Shopping Service (CSS)
                  </p>
                  <p className="text-sm text-blue-600">
                    Les partenaires CSS permettent de réduire vos coûts d'enchères 
                    Google Shopping jusqu'à 20% tout en maintenant les mêmes performances.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Économies garanties</p>
                  <p className="text-xs text-muted-foreground">
                    Réduction automatique des enchères
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Même visibilité</p>
                  <p className="text-xs text-muted-foreground">
                    Aucun impact sur vos positions
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Configuration simple</p>
                  <p className="text-xs text-muted-foreground">
                    Activation en quelques clics
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              En savoir plus sur Google CSS
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fournisseurs disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Fournisseurs CSS disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {cssProviders.map((provider) => (
              <div key={provider.value} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{provider.label}</p>
                    <Badge variant="secondary">{provider.savings}</Badge>
                    {selectedProvider === provider.value && isActive && (
                      <Badge className="bg-green-100 text-green-800">Actuel</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Détails
                  </Button>
                  {selectedProvider !== provider.value && (
                    <Button size="sm">
                      Activer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};