import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  ShoppingCart,
  RefreshCw,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { useAIStockSuggestions } from '@/hooks/useAIStockSuggestions';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export const AIStockDashboard: React.FC = () => {
  const {
    suggestions,
    alerts,
    forecasts,
    loading,
    generateAISuggestions,
    generateStockForecast,
    resolveAlert,
    applySuggestion,
  } = useAIStockSuggestions();

  const { inventory } = useInventoryManagement();
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const highConfidenceSuggestions = suggestions.filter(s => s.confidence_score > 0.7);
  const criticalAlerts = alerts.filter(a => a.alert_type === 'critical' || a.alert_type === 'out_of_stock');

  const handleGenerateForAllProducts = async () => {
    for (const product of inventory.slice(0, 5)) { // Limiter pour la démo
      try {
        await generateAISuggestions(product.id);
        await generateStockForecast(product.id);
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
      }
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock': return 'text-red-500';
      case 'low_stock': return 'text-orange-500';
      case 'overstock': return 'text-yellow-500';
      case 'demand_spike': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'upsell': return 'Montée gamme';
      case 'cross_sell': return 'Vente croisée';
      case 'combo': return 'Pack';
      case 'accessory': return 'Accessoire';
      default: return type;
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header avec métriques IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Brain className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suggestions IA</p>
              <p className="text-2xl font-bold">{highConfidenceSuggestions.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alertes critiques</p>
              <p className="text-2xl font-bold">{criticalAlerts.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prévisions actives</p>
              <p className="text-2xl font-bold">{forecasts.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Précision IA</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              Intelligence Artificielle - Gestion des Stocks
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateForAllProducts} 
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Analyser tout
              </Button>
              <Button onClick={() => selectedProduct && generateAISuggestions(selectedProduct)}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Générer suggestions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList>
              <TabsTrigger value="suggestions">
                Suggestions IA ({suggestions.length})
              </TabsTrigger>
              <TabsTrigger value="alerts">
                Alertes ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="forecasts">
                Prévisions ({forecasts.length})
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics IA</TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Suggestions de produits complémentaires</h3>
                  <Badge variant="outline">
                    {highConfidenceSuggestions.length} haute confiance
                  </Badge>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit principal</TableHead>
                        <TableHead>Suggestion</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Confiance</TableHead>
                        <TableHead>Fréquence</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suggestions.map((suggestion) => (
                        <TableRow key={suggestion.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">Produit principal</p>
                              <p className="text-sm text-muted-foreground">
                                ID: {suggestion.primary_product_id.slice(0, 8)}...
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {suggestion.suggested_product?.name || 'Produit suggéré'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {suggestion.suggested_product?.sku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getSuggestionTypeLabel(suggestion.suggestion_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={suggestion.confidence_score * 100} 
                                className="w-16"
                              />
                              <span className="text-sm">
                                {formatConfidence(suggestion.confidence_score)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {suggestion.frequency_count}x
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => applySuggestion(suggestion.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alertes intelligentes</h3>
                
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune alerte active</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Card key={alert.id} className="border-l-4 border-l-red-500">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className={`h-5 w-5 ${getAlertColor(alert.alert_type)}`} />
                            <div>
                              <p className="font-medium">
                                {alert.alert_type === 'low_stock' && 'Stock faible'}
                                {alert.alert_type === 'out_of_stock' && 'Rupture de stock'}
                                {alert.alert_type === 'overstock' && 'Surstock'}
                                {alert.alert_type === 'demand_spike' && 'Pic de demande'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {alert.inventory_item?.name || 'Produit inconnu'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Seuil: {alert.threshold_value} | Actuel: {alert.current_value}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Badge 
                              variant={alert.alert_type === 'out_of_stock' ? 'destructive' : 'secondary'}
                            >
                              {alert.alert_type}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Résoudre
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="forecasts">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Prévisions de stock</h3>
                
                {forecasts.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune prévision disponible</p>
                    <Button className="mt-4" onClick={() => selectedProduct && generateStockForecast(selectedProduct)}>
                      Générer des prévisions
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Demande 7j</TableHead>
                          <TableHead>Demande 30j</TableHead>
                          <TableHead>Commande suggérée</TableHead>
                          <TableHead>Confiance</TableHead>
                          <TableHead>Facteur saisonnier</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {forecasts.map((forecast) => (
                          <TableRow key={forecast.item_id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">Produit</p>
                                <p className="text-sm text-muted-foreground">
                                  ID: {forecast.item_id.slice(0, 8)}...
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {forecast.predicted_demand_7d} unités
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {forecast.predicted_demand_30d} unités
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-4 w-4 text-green-500" />
                                <span>{forecast.suggested_order_quantity}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress 
                                  value={forecast.confidence_level * 100} 
                                  className="w-16"
                                />
                                <span className="text-sm">
                                  {formatConfidence(forecast.confidence_level)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={forecast.seasonal_factor > 1 ? "default" : "secondary"}
                              >
                                {forecast.seasonal_factor.toFixed(2)}x
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Analytics et Performance IA</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Précision des suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Suggestions appliquées</span>
                          <Badge>23/30</Badge>
                        </div>
                        <Progress value={76.7} />
                        <p className="text-sm text-muted-foreground">
                          77% des suggestions ont été acceptées ce mois
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Impact sur les ventes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Augmentation CA</span>
                          <Badge variant="default">+12.5%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Ventes croisées</span>
                          <Badge variant="outline">+8.3%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Les suggestions IA ont généré 2,340€ de CA supplémentaire
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optimisation stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Ruptures évitées</span>
                          <Badge variant="default">7</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Réduction surstock</span>
                          <Badge variant="outline">-15%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Économies estimées: 890€ sur les coûts de stockage
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tendances détectées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Coques iPhone tendance</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Écrans Samsung populaires</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Batteries en baisse</span>
                          <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};