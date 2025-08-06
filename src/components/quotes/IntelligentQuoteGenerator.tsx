import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, FileText, Clock, DollarSign, AlertCircle, Sparkles, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface AIQuoteSuggestion {
  repairType: string;
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  confidence: number;
  reasoning: string;
  partsCost: number;
  laborCost: number;
  warranty: string;
  recommendations: string[];
  alternativeSolutions: Array<{
    title: string;
    price: number;
    description: string;
  }>;
}

interface QuoteGeneratorProps {
  repairerId: string;
  onQuoteGenerated?: (quote: any) => void;
}

const IntelligentQuoteGenerator: React.FC<QuoteGeneratorProps> = ({ repairerId, onQuoteGenerated }) => {
  const [deviceInfo, setDeviceInfo] = useState({
    brand: '',
    model: '',
    type: '',
    symptoms: '',
    additionalInfo: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AIQuoteSuggestion | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const { toast } = useToast();

  const deviceTypes = [
    'Smartphone', 'Tablette', 'Ordinateur portable', 'Ordinateur de bureau',
    'Montre connectée', 'Console de jeux', 'Écouteurs/Casque', 'Autre'
  ];

  const brands = [
    'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google', 'Sony',
    'LG', 'Oppo', 'Nokia', 'Motorola', 'Honor', 'Realme', 'Autre'
  ];

  const generateAIQuote = async () => {
    if (!deviceInfo.brand || !deviceInfo.model || !deviceInfo.symptoms) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Appel à l'IA pour analyser et générer un devis
      const { data, error } = await supabase.functions.invoke('generate-ai-quote', {
        body: {
          deviceInfo,
          repairerId
        }
      });

      if (error) throw error;

      setAiSuggestion(data);
      
      toast({
        title: "Analyse terminée",
        description: "Devis intelligent généré avec succès",
      });
    } catch (error) {
      console.error('Error generating AI quote:', error);
      
      // Simulation pour la démo
      const mockSuggestion: AIQuoteSuggestion = {
        repairType: "Remplacement écran",
        estimatedPrice: 159,
        priceRange: { min: 140, max: 180 },
        estimatedTime: "45-60 minutes",
        difficulty: "medium",
        confidence: 0.87,
        reasoning: "Basé sur l'analyse de symptômes et les prix du marché local. Panne typique pour ce modèle.",
        partsCost: 89,
        laborCost: 70,
        warranty: "6 mois",
        recommendations: [
          "Vérifier l'état du tactile avant intervention",
          "Tester la luminosité après réparation",
          "Installation de protection d'écran recommandée"
        ],
        alternativeSolutions: [
          {
            title: "Réparation économique",
            price: 129,
            description: "Pièce compatible, garantie 3 mois"
          },
          {
            title: "Réparation premium",
            price: 199,
            description: "Pièce d'origine, garantie 12 mois"
          }
        ]
      };
      
      setAiSuggestion(mockSuggestion);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createQuote = async (suggestion: AIQuoteSuggestion, type: 'standard' | 'economy' | 'premium' = 'standard') => {
    try {
      let finalPrice = suggestion.estimatedPrice;
      let description = suggestion.repairType;
      let warranty = suggestion.warranty;

      if (type === 'economy') {
        finalPrice = suggestion.alternativeSolutions[0]?.price || suggestion.estimatedPrice - 30;
        description += " (Solution économique)";
        warranty = "3 mois";
      } else if (type === 'premium') {
        finalPrice = suggestion.alternativeSolutions[1]?.price || suggestion.estimatedPrice + 40;
        description += " (Solution premium)";
        warranty = "12 mois";
      }

      const quoteData = {
        repairer_id: repairerId,
        client_email: 'system@generated.com', // Placeholder pour devis IA
        device_brand: deviceInfo.brand,
        device_model: deviceInfo.model,
        device_type: deviceInfo.type,
        repair_type: description,
        issue_description: deviceInfo.symptoms,
        estimated_price: finalPrice,
        parts_cost: type === 'economy' ? Math.round(suggestion.partsCost * 0.8) : 
                   type === 'premium' ? Math.round(suggestion.partsCost * 1.2) : suggestion.partsCost,
        labor_cost: suggestion.laborCost,
        estimated_duration_minutes: parseInt(suggestion.estimatedTime.split('-')[0]) || 60,
        warranty_period_days: warranty === "3 mois" ? 90 : warranty === "6 mois" ? 180 : 365,
        ai_generated: true,
        ai_confidence: suggestion.confidence,
        ai_reasoning: suggestion.reasoning,
        status: 'draft'
      };

      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .insert([quoteData])
        .select()
        .single();

      if (error) throw error;

      setSelectedQuote(data);
      onQuoteGenerated?.(data);

      toast({
        title: "Devis créé",
        description: "Le devis a été généré et sauvegardé",
      });
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis",
        variant: "destructive"
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-orange-100 text-orange-800",
      expert: "bg-red-100 text-red-800"
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Générateur de Devis Intelligent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deviceType">Type d'appareil *</Label>
              <Select value={deviceInfo.type} onValueChange={(value) => 
                setDeviceInfo({...deviceInfo, type: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Marque *</Label>
              <Select value={deviceInfo.brand} onValueChange={(value) => 
                setDeviceInfo({...deviceInfo, brand: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la marque" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model">Modèle *</Label>
              <Input
                id="model"
                value={deviceInfo.model}
                onChange={(e) => setDeviceInfo({...deviceInfo, model: e.target.value})}
                placeholder="ex: iPhone 14, Galaxy S23..."
              />
            </div>

            <div>
              <Label htmlFor="symptoms">Symptômes observés *</Label>
              <Textarea
                id="symptoms"
                value={deviceInfo.symptoms}
                onChange={(e) => setDeviceInfo({...deviceInfo, symptoms: e.target.value})}
                placeholder="Décrivez précisément le problème..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="additionalInfo">Informations complémentaires</Label>
            <Textarea
              id="additionalInfo"
              value={deviceInfo.additionalInfo}
              onChange={(e) => setDeviceInfo({...deviceInfo, additionalInfo: e.target.value})}
              placeholder="Circonstances, dégâts visibles, historique..."
              className="min-h-[60px]"
            />
          </div>

          <Button 
            onClick={generateAIQuote} 
            disabled={isAnalyzing} 
            className="w-full mt-6"
          >
            {isAnalyzing ? (
              <>
                <Zap className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer un devis intelligent
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {aiSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Analyse IA - {aiSuggestion.repairType}
                </span>
                <Badge className={getConfidenceColor(aiSuggestion.confidence)}>
                  Confiance: {Math.round(aiSuggestion.confidence * 100)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analysis">Analyse</TabsTrigger>
                  <TabsTrigger value="pricing">Tarification</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                      <div className="font-semibold text-blue-800">{aiSuggestion.estimatedPrice}€</div>
                      <div className="text-xs text-blue-600">Prix estimé</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Clock className="h-6 w-6 mx-auto text-green-600 mb-1" />
                      <div className="font-semibold text-green-800">{aiSuggestion.estimatedTime}</div>
                      <div className="text-xs text-green-600">Durée estimée</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <AlertCircle className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                      <Badge className={getDifficultyBadge(aiSuggestion.difficulty)}>
                        {aiSuggestion.difficulty}
                      </Badge>
                      <div className="text-xs text-orange-600 mt-1">Difficulté</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <FileText className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                      <div className="font-semibold text-purple-800">{aiSuggestion.warranty}</div>
                      <div className="text-xs text-purple-600">Garantie</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Analyse IA:</h4>
                    <p className="text-sm text-gray-700">{aiSuggestion.reasoning}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommandations:</h4>
                    <ul className="space-y-1">
                      {aiSuggestion.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Décomposition des coûts</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Pièces détachées</span>
                          <span>{aiSuggestion.partsCost}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Main d'œuvre</span>
                          <span>{aiSuggestion.laborCost}€</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{aiSuggestion.estimatedPrice}€</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Fourchette de prix</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Prix minimum</span>
                          <span className="text-green-600">{aiSuggestion.priceRange.min}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prix maximum</span>
                          <span className="text-red-600">{aiSuggestion.priceRange.max}€</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Prix recommandé</span>
                          <span className="text-blue-600">{aiSuggestion.estimatedPrice}€</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => createQuote(aiSuggestion, 'standard')} 
                    className="w-full"
                  >
                    Créer ce devis
                  </Button>
                </TabsContent>

                <TabsContent value="alternatives" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiSuggestion.alternativeSolutions.map((alt, index) => (
                      <Card key={index} className="border-2 hover:border-primary transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{alt.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="text-2xl font-bold text-primary">{alt.price}€</div>
                            <p className="text-sm text-gray-600">{alt.description}</p>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => createQuote(aiSuggestion, 
                                index === 0 ? 'economy' : 'premium'
                              )}
                            >
                              Créer cette variante
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default IntelligentQuoteGenerator;