import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  MapPin, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancementPanelProps {
  results: any[];
  onResultsUpdated: (updatedResults: any[]) => void;
}

interface EnhancementStats {
  total: number;
  enhanced: number;
  failed: number;
  processing: boolean;
}

const EnhancementPanel: React.FC<EnhancementPanelProps> = ({
  results,
  onResultsUpdated
}) => {
  const { toast } = useToast();
  const [enhancementStats, setEnhancementStats] = useState<EnhancementStats>({
    total: 0,
    enhanced: 0,
    failed: 0,
    processing: false
  });
  const [enhancementType, setEnhancementType] = useState<string | null>(null);

  const handleGeocodingEnhancement = async () => {
    setEnhancementType('geocoding');
    setEnhancementStats({
      total: results.length,
      enhanced: 0,
      failed: 0,
      processing: true
    });

    const resultsToGeocode = results.filter(r => !r.lat || !r.lng);
    let enhanced = 0;
    let failed = 0;

    for (const result of resultsToGeocode) {
      try {
        const fullAddress = `${result.address}, ${result.city || ''}, France`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
        );
        
        const data = await response.json();
        if (data && data[0]) {
          result.lat = parseFloat(data[0].lat);
          result.lng = parseFloat(data[0].lon);
          enhanced++;
        } else {
          failed++;
        }
        
        setEnhancementStats(prev => ({
          ...prev,
          enhanced: enhanced,
          failed: failed
        }));
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
      } catch (error) {
        failed++;
        setEnhancementStats(prev => ({
          ...prev,
          failed: failed
        }));
      }
    }

    setEnhancementStats(prev => ({ ...prev, processing: false }));
    onResultsUpdated([...results]);
    
    toast({
      title: "Géocodage terminé",
      description: `${enhanced} adresses géocodées avec succès, ${failed} échecs`
    });
  };

  const handleAIClassification = async () => {
    setEnhancementType('classification');
    setEnhancementStats({
      total: results.length,
      enhanced: 0,
      failed: 0,
      processing: true
    });

    try {
      const { data, error } = await supabase.functions.invoke('deepseek-classify', {
        body: {
          repairers: results.map(r => ({
            name: r.name,
            description: r.description || '',
            website: r.website || ''
          }))
        }
      });

      if (error) throw error;

      const classifications = data.classifications || [];
      let enhanced = 0;

      classifications.forEach((classification: any, index: number) => {
        if (classification && results[index]) {
          results[index].services = classification.services || [];
          results[index].specialties = classification.specialties || [];
          results[index].confidence = classification.confidence || 0;
          enhanced++;
        }
      });

      setEnhancementStats({
        total: results.length,
        enhanced,
        failed: results.length - enhanced,
        processing: false
      });

      onResultsUpdated([...results]);
      
      toast({
        title: "Classification IA terminée",
        description: `${enhanced} réparateurs classifiés avec succès`
      });
    } catch (error: any) {
      setEnhancementStats(prev => ({ ...prev, processing: false }));
      toast({
        title: "Erreur classification IA",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDataEnhancement = async () => {
    setEnhancementType('enhancement');
    setEnhancementStats({
      total: results.length,
      enhanced: 0,
      failed: 0,
      processing: true
    });

    try {
      const { data, error } = await supabase.functions.invoke('deepseek-enhance', {
        body: {
          repairers: results.map(r => ({
            name: r.name,
            address: r.address,
            description: r.description || '',
            website: r.website || ''
          }))
        }
      });

      if (error) throw error;

      const enhancements = data.enhancements || [];
      let enhanced = 0;

      enhancements.forEach((enhancement: any, index: number) => {
        if (enhancement && results[index]) {
          results[index].phone = enhancement.phone || results[index].phone;
          results[index].email = enhancement.email || results[index].email;
          results[index].description = enhancement.description || results[index].description;
          enhanced++;
        }
      });

      setEnhancementStats({
        total: results.length,
        enhanced,
        failed: results.length - enhanced,
        processing: false
      });

      onResultsUpdated([...results]);
      
      toast({
        title: "Amélioration des données terminée",
        description: `${enhanced} réparateurs améliorés avec succès`
      });
    } catch (error: any) {
      setEnhancementStats(prev => ({ ...prev, processing: false }));
      toast({
        title: "Erreur amélioration des données",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getProgressPercentage = () => {
    if (enhancementStats.total === 0) return 0;
    return Math.round(((enhancementStats.enhanced + enhancementStats.failed) / enhancementStats.total) * 100);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-admin-purple" />
          Améliorations IA et Géocodage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Boutons d'amélioration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleGeocodingEnhancement}
            disabled={enhancementStats.processing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Géocodage Nominatim</span>
          </Button>
          
          <Button
            onClick={handleAIClassification}
            disabled={enhancementStats.processing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>Classification IA</span>
          </Button>
          
          <Button
            onClick={handleDataEnhancement}
            disabled={enhancementStats.processing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Enrichissement Données</span>
          </Button>
        </div>

        {/* Indicateur de progression */}
        {enhancementStats.processing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {enhancementType === 'geocoding' && 'Géocodage en cours...'}
                {enhancementType === 'classification' && 'Classification IA en cours...'}
                {enhancementType === 'enhancement' && 'Amélioration des données en cours...'}
              </span>
              <span className="text-muted-foreground">
                {enhancementStats.enhanced + enhancementStats.failed} / {enhancementStats.total}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        )}

        {/* Statistiques des améliorations */}
        {(enhancementStats.enhanced > 0 || enhancementStats.failed > 0) && !enhancementStats.processing && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-admin-green flex items-center justify-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {enhancementStats.enhanced}
              </div>
              <div className="text-xs text-muted-foreground">Améliorés</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-admin-red flex items-center justify-center">
                <XCircle className="h-4 w-4 mr-1" />
                {enhancementStats.failed}
              </div>
              <div className="text-xs text-muted-foreground">Échecs</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-admin-blue">
                {enhancementStats.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        )}

        {/* Résumé des améliorations disponibles */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>Géocodage:</strong> {results.filter(r => !r.lat || !r.lng).length} adresses à géocoder</p>
          <p>• <strong>Classification:</strong> {results.filter(r => !r.services || r.services.length === 0).length} réparateurs à classifier</p>
          <p>• <strong>Enrichissement:</strong> {results.filter(r => !r.phone || !r.email).length} contacts manquants</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancementPanel;