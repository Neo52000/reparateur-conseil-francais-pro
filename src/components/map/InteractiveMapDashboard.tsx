import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  Navigation, 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  MapPin, 
  Layers,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';
import { useMapStore } from '@/stores/mapStore';
import { useRepairers } from '@/hooks/useRepairers';
import { useGeolocation } from '@/hooks/useGeolocation';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';
import IntelligentGeolocation from '@/components/geolocation/IntelligentGeolocation';

interface MapFilter {
  service: string;
  radius: number;
  rating: number;
  verified: boolean;
}

interface ClusterData {
  city: string;
  count: number;
  averageRating: number;
  center: [number, number];
  bounds: [[number, number], [number, number]];
}

const InteractiveMapDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MapFilter>({
    service: 'all',
    radius: 25,
    rating: 0,
    verified: false
  });
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);
  
  const { userLocation, getUserLocation } = useGeolocation();
  const { center, zoom, repairers } = useMapStore();
  const { repairers: allRepairers, loading } = useRepairers();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allRepairers.length > 0) {
      generateClusters();
    }
  }, [allRepairers, filters]);

  const generateClusters = () => {
    // Grouper les réparateurs par ville
    const cityGroups = allRepairers.reduce((acc, repairer) => {
      if (!repairer.city) return acc;
      
      const city = repairer.city.trim();
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(repairer);
      return acc;
    }, {} as Record<string, typeof allRepairers>);

    // Créer les clusters
    const newClusters: ClusterData[] = Object.entries(cityGroups)
      .filter(([_, repairers]) => repairers.length >= 2)
      .map(([city, cityRepairers]) => {
        const validCoords = cityRepairers.filter(r => r.lat && r.lng);
        if (validCoords.length === 0) return null;

        const avgLat = validCoords.reduce((sum, r) => sum + r.lat!, 0) / validCoords.length;
        const avgLng = validCoords.reduce((sum, r) => sum + r.lng!, 0) / validCoords.length;
        const avgRating = validCoords.reduce((sum, r) => sum + (r.rating || 0), 0) / validCoords.length;

        // Calculer les bounds
        const lats = validCoords.map(r => r.lat!);
        const lngs = validCoords.map(r => r.lng!);
        const bounds: [[number, number], [number, number]] = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        ];

        return {
          city,
          count: cityRepairers.length,
          averageRating: avgRating,
          center: [avgLat, avgLng] as [number, number],
          bounds
        };
      })
      .filter(Boolean) as ClusterData[];

    setClusters(newClusters.sort((a, b) => b.count - a.count));
  };

  const handleClusterClick = (cluster: ClusterData) => {
    // Centrer la carte sur le cluster
    // Cette fonctionnalité serait implémentée avec le store de la carte
    console.log('Zoom sur cluster:', cluster);
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Géocodage de la recherche
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=fr`,
        {
          headers: {
            'User-Agent': 'RepairMap/1.0'
          }
        }
      );
      
      const results = await response.json();
      if (results.length > 0) {
        const result = results[0];
        const coordinates: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
        
        // Mettre à jour la carte
        // useMapStore().setCenter(coordinates);
        // useMapStore().setZoom(12);
        
        console.log('Navigation vers:', coordinates);
      }
    } catch (error) {
      console.error('Erreur recherche localisation:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{allRepairers.length}</div>
                <div className="text-sm text-muted-foreground">Réparateurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{clusters.length}</div>
                <div className="text-sm text-muted-foreground">Zones</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {userLocation ? '1' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Position</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {(allRepairers.reduce((sum, r) => sum + (r.rating || 0), 0) / allRepairers.length || 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Note moy.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map">
            <Map className="w-4 h-4 mr-2" />
            Carte
          </TabsTrigger>
          <TabsTrigger value="location">
            <Navigation className="w-4 h-4 mr-2" />
            Localisation
          </TabsTrigger>
          <TabsTrigger value="clusters">
            <Layers className="w-4 h-4 mr-2" />
            Clusters
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Recherche
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Carte Interactive
                </span>
                <Button
                  onClick={() => setShowFullscreenMap(true)}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Plein écran
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef}
                className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => setShowFullscreenMap(true)}
              >
                <div className="text-center">
                  <Map className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Cliquez pour ouvrir la carte interactive</p>
                  <Badge variant="secondary" className="mt-2">
                    {allRepairers.length} réparateurs disponibles
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <IntelligentGeolocation />
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Zones de concentration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clusters.map((cluster) => (
                  <div
                    key={cluster.city}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleClusterClick(cluster)}
                  >
                    <div>
                      <div className="font-medium">{cluster.city}</div>
                      <div className="text-sm text-muted-foreground">
                        {cluster.count} réparateurs • Note: {cluster.averageRating.toFixed(1)}⭐
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {cluster.count}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Target className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {clusters.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun cluster détecté</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Recherche géographique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher une ville, adresse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                  className="flex-1"
                />
                <Button onClick={handleSearchLocation}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Service</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded"
                    value={filters.service}
                    onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
                  >
                    <option value="all">Tous</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="tablette">Tablette</option>
                    <option value="ordinateur">Ordinateur</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Rayon (km)</label>
                  <Input
                    type="number"
                    value={filters.radius}
                    onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) || 25 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={getUserLocation}
                variant="outline" 
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Utiliser ma position
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal carte plein écran */}
      {showFullscreenMap && (
        <EnhancedRepairersMap
          onClose={() => setShowFullscreenMap(false)}
          searchFilters={filters}
        />
      )}
    </div>
  );
};

export default InteractiveMapDashboard;