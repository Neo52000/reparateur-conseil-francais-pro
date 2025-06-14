
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Euro, Clock, TrendingUp } from 'lucide-react';

interface PriceCalculation {
  partsCost: number;
  laborCost: number;
  markup: number;
  total: number;
  timeEstimate: number;
}

const PriceCalculator = () => {
  const [device, setDevice] = useState('');
  const [repairType, setRepairType] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [laborHours, setLaborHours] = useState('');
  const [markup, setMarkup] = useState('30');
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null);

  const devices = [
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 
    'iPhone 13', 'Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23+', 'Samsung Galaxy S23',
    'Samsung Galaxy S22 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13'
  ];

  const repairTypes = [
    { id: 'screen', name: 'Remplacement écran', avgTime: 1.5, avgCost: 89 },
    { id: 'battery', name: 'Remplacement batterie', avgTime: 0.5, avgCost: 25 },
    { id: 'charging-port', name: 'Port de charge', avgTime: 2, avgCost: 35 },
    { id: 'camera', name: 'Réparation caméra', avgTime: 1, avgCost: 45 },
    { id: 'speaker', name: 'Haut-parleur', avgTime: 0.75, avgCost: 20 },
    { id: 'water-damage', name: 'Dégât des eaux', avgTime: 3, avgCost: 0 }
  ];

  const laborRates = [
    { region: 'Paris', rate: 45 },
    { region: 'Lyon', rate: 35 },
    { region: 'Marseille', rate: 32 },
    { region: 'Toulouse', rate: 30 },
    { region: 'Bordeaux', rate: 33 },
    { region: 'Lille', rate: 31 },
    { region: 'Autres', rate: 28 }
  ];

  const [selectedRegion, setSelectedRegion] = useState('Paris');

  const calculatePrice = () => {
    const partsPrice = parseFloat(partsCost) || 0;
    const hours = parseFloat(laborHours) || 0;
    const markupPercent = parseFloat(markup) || 0;
    const hourlyRate = laborRates.find(r => r.region === selectedRegion)?.rate || 28;

    const laborCost = hours * hourlyRate;
    const subtotal = partsPrice + laborCost;
    const markupAmount = (subtotal * markupPercent) / 100;
    const total = subtotal + markupAmount;

    setCalculation({
      partsCost: partsPrice,
      laborCost: laborCost,
      markup: markupAmount,
      total: total,
      timeEstimate: hours
    });
  };

  const fillSuggestedValues = () => {
    const selectedRepair = repairTypes.find(r => r.id === repairType);
    if (selectedRepair) {
      setPartsCost(selectedRepair.avgCost.toString());
      setLaborHours(selectedRepair.avgTime.toString());
    }
  };

  const marketPrices = [
    { service: 'Remplacement écran iPhone 13', min: 120, max: 180, avg: 150 },
    { service: 'Batterie iPhone 13', min: 40, max: 70, avg: 55 },
    { service: 'Écran Samsung S23', min: 110, max: 160, avg: 135 },
    { service: 'Port de charge iPhone', min: 60, max: 100, avg: 80 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-blue-600" />
            Calculateur de Prix
          </CardTitle>
          <CardDescription>
            Calculez le prix de vos réparations rapidement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Selection */}
          <div className="space-y-2">
            <Label htmlFor="device">Appareil</Label>
            <Select value={device} onValueChange={setDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez l'appareil" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Repair Type */}
          <div className="space-y-2">
            <Label htmlFor="repair-type">Type de réparation</Label>
            <Select value={repairType} onValueChange={setRepairType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de réparation" />
              </SelectTrigger>
              <SelectContent>
                {repairTypes.map((repair) => (
                  <SelectItem key={repair.id} value={repair.id}>
                    {repair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {repairType && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fillSuggestedValues}
                className="w-full"
              >
                Utiliser les valeurs suggérées
              </Button>
            )}
          </div>

          {/* Region Selection */}
          <div className="space-y-2">
            <Label htmlFor="region">Région (tarif horaire)</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {laborRates.map((region) => (
                  <SelectItem key={region.region} value={region.region}>
                    {region.region} - {region.rate}€/h
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parts Cost */}
          <div className="space-y-2">
            <Label htmlFor="parts-cost">Coût des pièces (€)</Label>
            <Input
              id="parts-cost"
              type="number"
              value={partsCost}
              onChange={(e) => setPartsCost(e.target.value)}
              placeholder="Ex: 89.90"
            />
          </div>

          {/* Labor Hours */}
          <div className="space-y-2">
            <Label htmlFor="labor-hours">Temps de main d'œuvre (heures)</Label>
            <Input
              id="labor-hours"
              type="number"
              step="0.25"
              value={laborHours}
              onChange={(e) => setLaborHours(e.target.value)}
              placeholder="Ex: 1.5"
            />
          </div>

          {/* Markup */}
          <div className="space-y-2">
            <Label htmlFor="markup">Marge bénéficiaire (%)</Label>
            <Input
              id="markup"
              type="number"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              placeholder="Ex: 30"
            />
          </div>

          <Button onClick={calculatePrice} className="w-full">
            <Euro className="h-4 w-4 mr-2" />
            Calculer le prix
          </Button>
        </CardContent>
      </Card>

      {/* Results and Market Data */}
      <div className="space-y-6">
        {/* Calculation Results */}
        {calculation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Résultat du Calcul
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Coût des pièces :</span>
                  <span className="font-medium">{calculation.partsCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Main d'œuvre :</span>
                  <span className="font-medium">{calculation.laborCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Marge ({markup}%) :</span>
                  <span className="font-medium">{calculation.markup.toFixed(2)} €</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Prix final :</span>
                    <span className="text-2xl font-bold text-green-600">
                      {calculation.total.toFixed(2)} €
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700">
                    Temps estimé : {calculation.timeEstimate}h 
                    ({Math.round(calculation.timeEstimate * 60)} minutes)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  Générer devis
                </Button>
                <Button variant="outline" size="sm">
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Prices Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Prix du Marché</CardTitle>
            <CardDescription>
              Référence des prix pratiqués en France
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {marketPrices.map((price, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{price.service}</h4>
                  <Badge variant="outline">{price.avg}€ moy.</Badge>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Min: {price.min}€</span>
                  <span>Max: {price.max}€</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriceCalculator;
