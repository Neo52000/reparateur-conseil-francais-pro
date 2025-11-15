import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Bell, BellOff, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { enhancedToast } from '@/components/ui/enhanced-toast';

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    deviceType?: string;
    brand?: string;
    city?: string;
    maxPrice?: number;
  };
  alertsEnabled: boolean;
  lastUsed: string;
  resultsCount: number;
}

export const SavedSearchFilters: React.FC<{ userId?: string }> = ({ userId }) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  useEffect(() => {
    if (userId) {
      loadSavedFilters();
    }
  }, [userId]);

  const loadSavedFilters = () => {
    // Mock data - TODO: Load from backend
    setSavedFilters([
      {
        id: '1',
        name: 'iPhone Paris',
        filters: {
          brand: 'Apple',
          city: 'Paris',
        },
        alertsEnabled: true,
        lastUsed: new Date().toISOString(),
        resultsCount: 12,
      },
      {
        id: '2',
        name: 'Samsung budget',
        filters: {
          brand: 'Samsung',
          maxPrice: 100,
        },
        alertsEnabled: false,
        lastUsed: new Date(Date.now() - 86400000).toISOString(),
        resultsCount: 8,
      },
    ]);
  };

  const saveCurrentFilters = () => {
    if (!newFilterName.trim()) {
      enhancedToast.error({
        title: 'Nom requis',
        description: 'Veuillez donner un nom à cette recherche',
      });
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName,
      filters: {}, // TODO: Get from current filters
      alertsEnabled: false,
      lastUsed: new Date().toISOString(),
      resultsCount: 0,
    };

    setSavedFilters([...savedFilters, newFilter]);
    setNewFilterName('');
    setIsCreating(false);

    enhancedToast.success({
      title: 'Recherche sauvegardée',
      description: 'Vous pouvez maintenant la réutiliser rapidement',
    });
  };

  const toggleAlerts = (id: string) => {
    setSavedFilters(savedFilters.map(filter =>
      filter.id === id
        ? { ...filter, alertsEnabled: !filter.alertsEnabled }
        : filter
    ));

    const filter = savedFilters.find(f => f.id === id);
    if (filter) {
      enhancedToast.success({
        title: filter.alertsEnabled ? 'Alertes désactivées' : 'Alertes activées',
        description: filter.alertsEnabled
          ? 'Vous ne recevrez plus de notifications'
          : 'Vous serez notifié des nouveaux résultats',
      });
    }
  };

  const deleteFilter = (id: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id));
    enhancedToast.success({
      title: 'Recherche supprimée',
    });
  };

  const applyFilter = (filter: SavedFilter) => {
    // TODO: Apply filters to search
    enhancedToast.info({
      title: 'Filtres appliqués',
      description: `${filter.resultsCount} réparateurs trouvés`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Mes recherches favorites
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? 'Annuler' : 'Sauvegarder cette recherche'}
          </Button>
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
              <Button onClick={saveCurrentFilters}>
                Sauvegarder
              </Button>
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
                          {filter.alertsEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Bell className="h-3 w-3 mr-1" />
                              Alertes ON
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(filter.filters).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => applyFilter(filter)}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher ({filter.resultsCount})
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAlerts(filter.id)}
                          >
                            {filter.alertsEnabled ? (
                              <BellOff className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFilter(filter.id)}
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
