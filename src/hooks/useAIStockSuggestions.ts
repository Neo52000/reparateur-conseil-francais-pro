import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AISuggestion {
  id: string;
  primary_product_id: string;
  suggested_product_id: string;
  suggestion_type: 'upsell' | 'cross_sell' | 'combo' | 'accessory';
  confidence_score: number;
  frequency_count: number;
  is_active: boolean;
  last_suggested: string;
  created_at: string;
  suggested_product?: any;
}

export interface StockAlert {
  id: string;
  product_id: string;
  repairer_id: string;
  alert_type: string;
  threshold_value: number;
  current_value: number;
  is_active: boolean;
  auto_order_enabled: boolean;
  last_triggered: string;
  created_at: string;
  inventory_item?: any;
}

export interface StockForecast {
  item_id: string;
  predicted_demand_7d: number;
  predicted_demand_30d: number;
  suggested_order_quantity: number;
  confidence_level: number;
  next_stockout_date?: string;
  seasonal_factor: number;
}

export const useAIStockSuggestions = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [forecasts, setForecasts] = useState<StockForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_product_suggestions')
        .select(`
          *,
          suggested_product:pos_inventory_items!suggested_product_id(*)
        `)
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setSuggestions((data || []) as AISuggestion[]);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select(`
          *,
          inventory_item:pos_inventory_items(*)
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    }
  };

  const generateAISuggestions = async (productId: string) => {
    try {
      setLoading(true);
      
      // Simuler l'analyse IA des ventes et créer des suggestions
      const { data: salesData, error: salesError } = await supabase
        .from('pos_transactions')
        .select(`
          *,
          items:pos_transaction_items(
            *,
            inventory_item:pos_inventory_items(*)
          )
        `)
        .limit(100);

      if (salesError) throw salesError;

      // Analyser les patterns de vente pour générer des suggestions
      const suggestions = await analyzeProductPatterns(productId, salesData);
      
      // Sauvegarder les suggestions
      for (const suggestion of suggestions) {
        const { error } = await supabase
          .from('ai_product_suggestions')
          .upsert({
            primary_product_id: productId,
            suggested_product_id: suggestion.productId,
            suggestion_type: suggestion.type,
            confidence_score: suggestion.confidence,
            is_active: true,
            last_suggested: new Date().toISOString()
          }, {
            onConflict: 'primary_product_id,suggested_product_id'
          });

        if (error) console.error('Error saving suggestion:', error);
      }

      await fetchSuggestions();
      
      toast({
        title: "Succès",
        description: "Suggestions IA générées avec succès",
      });
      
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les suggestions IA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeProductPatterns = async (productId: string, salesData: any[]) => {
    // Logique simplifiée d'analyse des patterns
    const suggestions = [];
    
    // Analyser les co-achats
    const coSales = new Map();
    salesData.forEach(transaction => {
      const productInTransaction = transaction.items?.find(
        (item: any) => item.inventory_item_id === productId
      );
      
      if (productInTransaction) {
        transaction.items?.forEach((item: any) => {
          if (item.inventory_item_id !== productId) {
            const count = coSales.get(item.inventory_item_id) || 0;
            coSales.set(item.inventory_item_id, count + 1);
          }
        });
      }
    });

    // Créer des suggestions basées sur la fréquence
    for (const [suggestedId, frequency] of coSales.entries()) {
      if (frequency >= 3) { // Seuil minimum
        suggestions.push({
          productId: suggestedId,
          type: frequency >= 5 ? 'upsell' : 'cross_sell',
          confidence: Math.min(frequency * 0.15, 0.95)
        });
      }
    }

    return suggestions.slice(0, 5); // Limiter à 5 suggestions
  };

  const generateStockForecast = async (itemId: string) => {
    try {
      // Récupérer l'historique des ventes
      const { data: salesHistory, error } = await supabase
        .from('pos_transaction_items')
        .select(`
          quantity,
          pos_transactions!inner(transaction_date)
        `)
        .eq('inventory_item_id', itemId)
        .gte('pos_transactions.transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculer la prévision (logique simplifiée)
      const totalQuantity = salesHistory.reduce((sum, item) => sum + item.quantity, 0);
      const dailyAverage = totalQuantity / 90;
      
      const forecast: StockForecast = {
        item_id: itemId,
        predicted_demand_7d: Math.round(dailyAverage * 7),
        predicted_demand_30d: Math.round(dailyAverage * 30),
        suggested_order_quantity: Math.round(dailyAverage * 45), // 1.5 mois de stock
        confidence_level: salesHistory.length > 10 ? 0.8 : 0.5,
        seasonal_factor: 1.0
      };

      setForecasts(prev => [...prev.filter(f => f.item_id !== itemId), forecast]);
      
      return forecast;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  };

  const createStockAlert = async (alert: Partial<StockAlert>) => {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .insert({
          ...alert,
          product_id: alert.product_id || '',
          repairer_id: alert.repairer_id || 'current_user_id'
        });

      if (error) throw error;
      
      await fetchStockAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ is_active: false })
        .eq('id', alertId);

      if (error) throw error;
      
      await fetchStockAlerts();
      
      toast({
        title: "Succès",
        description: "Alerte résolue",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Erreur",
        description: "Impossible de résoudre l'alerte",
        variant: "destructive",
      });
    }
  };

  const applySuggestion = async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      // Créer un lien produit basé sur la suggestion
      const { error } = await supabase
        .from('product_links')
        .insert({
          primary_product_id: suggestion.primary_product_id,
          linked_product_id: suggestion.suggested_product_id,
          link_type: suggestion.suggestion_type,
          is_automatic: true,
          ai_confidence: suggestion.confidence_score
        });

      if (error) throw error;

      // Incrémenter le compteur de fréquence
      await supabase
        .from('ai_product_suggestions')
        .update({ 
          frequency_count: suggestion.frequency_count + 1,
          last_suggested: new Date().toISOString()
        })
        .eq('id', suggestionId);

      toast({
        title: "Succès",
        description: "Suggestion appliquée avec succès",
      });

      await fetchSuggestions();
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer la suggestion",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchStockAlerts();
  }, []);

  return {
    suggestions,
    alerts,
    forecasts,
    loading,
    fetchSuggestions,
    generateAISuggestions,
    generateStockForecast,
    createStockAlert,
    resolveAlert,
    applySuggestion,
  };
};