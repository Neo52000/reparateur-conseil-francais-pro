
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  ChevronRight,
  Zap,
  CheckCircle
} from 'lucide-react';
import AIInsightsService, { AIInsight } from '@/services/advertising/AIInsightsService';

interface AIInsightsWidgetProps {
  onActionClick?: (insight: AIInsight) => void;
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ onActionClick }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const aiService = AIInsightsService.getInstance();
      const generatedInsights = await aiService.generateInsights();
      setInsights(generatedInsights.slice(0, 5)); // Afficher les 5 plus importants
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (insight: AIInsight) => {
    if (!insight.actionable || !insight.action) return;

    setExecutingActions(prev => new Set([...prev, insight.id]));
    
    try {
      // Execute action via Supabase function
      const { error } = await supabase.functions.invoke('execute-ai-insight', {
        body: { 
          insightId: insight.id, 
          action: insight.action 
        }
      });

      if (error) throw error;
      
      if (onActionClick) {
        onActionClick(insight);
      }

      // Marquer comme exécuté
      setInsights(prev => prev.map(i => 
        i.id === insight.id 
          ? { ...i, actionable: false }
          : i
      ));
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setExecutingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(insight.id);
        return newSet;
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'optimization': return Target;
      case 'alert': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      default: return Brain;
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

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Insights IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Insights IA
            <Badge variant="secondary" className="ml-2">
              Temps réel
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadInsights}
            className="text-blue-600"
          >
            <Zap className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun insight disponible pour le moment</p>
          </div>
        ) : (
          insights.map((insight) => {
            const IconComponent = getInsightIcon(insight.type);
            const isExecuting = executingActions.has(insight.id);
            
            return (
              <div
                key={insight.id}
                className={`p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border-l-4 ${getPriorityBorderColor(insight.priority)} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {insight.title}
                        </h4>
                        <Badge 
                          variant={getPriorityColor(insight.priority) as any}
                          className="text-xs px-2 py-0.5"
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Impact: {insight.impact}</span>
                          <span>•</span>
                          <span>Confiance: {insight.confidence}%</span>
                        </div>
                        
                        {insight.actionable && insight.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActionClick(insight)}
                            disabled={isExecuting}
                            className="ml-2 text-xs h-7"
                          >
                            {isExecuting ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1" />
                                Exécution...
                              </>
                            ) : (
                              <>
                                {insight.action.label}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                        
                        {!insight.actionable && (
                          <div className="flex items-center text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Appliqué
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {insights.length > 0 && (
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-blue-600">
              Voir tous les insights
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;
