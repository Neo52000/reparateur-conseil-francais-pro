import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Bell, BellOff, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    deviceType?: string;
    brand?: string;
    city?: string;
    maxPrice?: number;
  };
  alerts_enabled: boolean;
  last_used: string;
  results_count: number;
}

export const SavedSearchFilters: React.FC<{ userId?: string }> = ({ userId }) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadSavedFilters();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadSavedFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_search_filters')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedFilters(
        (data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          filters: f.filters || {},
          alerts_enabled: f.alerts_enabled,
          last_used: f.last_used || f.created_at,
          results_count: f.results_count || 0,
        }))
      );
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentFilters = async () => {
    if (!newFilterName.trim()) {
      enhancedToast.error({
        title: 'Nom requis',
        description: 'Veuillez donner un nom à cette recherche',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_search_filters')
        .insert({
          user_id: userId!,
          name: newFilterName,
          filters: {},
          alerts_enabled: false,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedFilters(prev => [{
        id: data.id,
        name: data.name,
        filters: (data.filters || {}) as SavedFilter['filters'],
        alerts_enabled: data.alerts_enabled,
        last_used: data.created_at,
        results_count: 0,
      }, ...prev]);

      setNewFilterName('');
      setIsCreating(false);

      enhancedToast.success({
        title: 'Recherche sauvegardée',
        description: 'Vous pouvez maintenant la réutiliser rapidement',
      });
    } catch (error) {
      console.error('Erreur sauvegarde filtre:', error);
      enhancedToast.error({ title: 'Erreur', description: 'Impossible de sauvegarder' });
    }
  };

  const toggleAlerts = async (id: string) => {
    const filter = savedFilters.find(f => f.id === id);
    if (!filter) return;

    const newValue = !filter.alerts_enabled;

    try {
      await supabase
        .from('saved_search_filters')
        .update({ alerts_enabled: newValue })
        .eq('id', id);

      setSavedFilters(prev =>
        prev.map(f => f.id === id ? { ...f, alerts_enabled: newValue } : f)
      );

      enhancedToast.success({
        title: newValue ? 'Alertes activées' : 'Alertes désactivées',
        description: newValue
          ? 'Vous serez notifié des nouveaux résultats'
          : 'Vous ne recevrez plus de notifications',
      });
    } catch (error) {
      console.error('Erreur toggle alertes:', error);
    }
  };

  const deleteFilter = async (id: string) => {
    try {
      await supabase.from('saved_search_filters').delete().eq('id', id);
      setSavedFilters(prev => prev.filter(f => f.id !== id));
      enhancedToast.success({ title: 'Recherche supprimée' });
    } catch (error) {
      console.error('Erreur suppression filtre:', error);
    }
  };

  const applyFilter = (filter: SavedFilter) => {
    const params = new URLSearchParams();
    if (filter.filters.brand) params.set('brand', filter.filters.brand);
    if (filter.filters.city) params.set('city', filter.filters.city);
    if (filter.filters.deviceType) params.set('type', filter.filters.deviceType);
    if (filter.filters.maxPrice) params.set('maxPrice', String(filter.filters.maxPrice));

    // Update last_used
    supabase
      .from('saved_search_filters')
      .update({ last_used: new Date().toISOString() })
      .eq('id', filter.id)
      .then();

    navigate(`/search?${params.toString()}`);
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Mes recherches favorites
          </CardTitle>
          {userId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(!isCreating)}
            >
              {isCreating ? 'Annuler' : 'Sauvegarder cette recherche'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <Input
                placeholder="Nom de la recherche (ex: iPhone Paris)"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveCurrentFilters()}
              />
              <Button onClick={saveCurrentFilters}>Sauvegarder</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {savedFilters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Aucune recherche sauvegardée</p>
            <p className="text-sm mt-1">Sauvegardez vos filtres pour y accéder rapidement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedFilters.map((filter) => (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{filter.name}</h4>
                          {filter.alerts_enabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Bell className="h-3 w-3 mr-1" />
                              Alertes ON
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(filter.filters).map(([key, value]) => (
                            value && (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            )
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => applyFilter(filter)}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAlerts(filter.id)}
                            aria-label={filter.alerts_enabled ? 'Désactiver les alertes' : 'Activer les alertes'}
                          >
                            {filter.alerts_enabled ? (
                              <BellOff className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFilter(filter.id)}
                            aria-label="Supprimer la recherche"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
