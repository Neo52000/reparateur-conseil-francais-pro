
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  DollarSign, 
  Palette, 
  Clock,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import RecommendationEngine, { Recommendation } from '@/services/advertising/RecommendationEngine';

const SmartRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [implementingIds, setImplementingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const engine = RecommendationEngine.getInstance();
      const recs = await engine.generateSmartRecommendations();
      setRecommendations(recs.slice(0, 4)); // Top 4 recommendations
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImplement = async (recommendation: Recommendation) => {
    setImplementingIds(prev => new Set([...prev, recommendation.id]));
    
    try {
      // Simuler l'implémentation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Marquer comme implémenté
      setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    } catch (error) {
      console.error('Error implementing recommendation:', error);
    } finally {
      setImplementingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recommendation.id);
        return newSet;
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return DollarSign;
      case 'targeting': return Target;
      case 'creative': return Palette;
      case 'timing': return Clock;
      default: return TrendingUp;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'budget': return 'text-green-600 bg-green-100';
      case 'targeting': return 'text-blue-600 bg-blue-100';
      case 'creative': return 'text-purple-600 bg-purple-100';
      case 'timing': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommandations Intelligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Recommandations Intelligentes
          </CardTitle>
          <Badge variant="outline" className="text-green-600">
            {recommendations.length} actives
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>Toutes les recommandations ont été appliquées !</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadRecommendations}
              className="mt-2"
            >
              Rechercher de nouvelles recommandations
            </Button>
          </div>
        ) : (
          recommendations.map((rec) => {
            const IconComponent = getTypeIcon(rec.type);
            const isImplementing = implementingIds.has(rec.id);
            
            return (
              <div
                key={rec.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(rec.type)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <Badge 
                          variant={getPriorityColor(rec.priority) as any}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Impact prévu */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Impact prévu: {rec.impact.metric}
                    </span>
                    <Badge variant="secondary" className="text-blue-700">
                      {rec.impact.expectedChange > 0 ? '+' : ''}{rec.impact.expectedChange}
                      {rec.type === 'budget' && rec.impact.metric.includes('€') ? '€' : '%'}
                    </Badge>
                  </div>
                  <Progress 
                    value={rec.impact.confidence} 
                    className="h-2"
                  />
                  <p className="text-xs text-blue-700 mt-1">
                    Confiance: {rec.impact.confidence}%
                  </p>
                </div>
                
                {/* Étapes d'action */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Étapes d'implémentation ({rec.estimatedImplementationTime} min)
                  </p>
                  <div className="space-y-1">
                    {rec.actionSteps.slice(0, 2).map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        {step}
                      </div>
                    ))}
                    {rec.actionSteps.length > 2 && (
                      <div className="text-xs text-gray-500 ml-3">
                        +{rec.actionSteps.length - 2} étapes supplémentaires
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <AlertCircle className="h-3 w-3" />
                    Ressources: {rec.resources.slice(0, 2).join(', ')}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleImplement(rec)}
                    disabled={isImplementing}
                    className="h-7"
                  >
                    {isImplementing ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                        Implémentation...
                      </>
                    ) : (
                      <>
                        Implémenter
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;
