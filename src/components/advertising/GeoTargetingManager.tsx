
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, MapPin, Circle, Map } from 'lucide-react';
import { AdvancedTargetingService } from '@/services/advancedTargeting';
import { GeoTargetingZone } from '@/types/advancedAdvertising';

const GeoTargetingManager: React.FC = () => {
  const [zones, setZones] = useState<GeoTargetingZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    type: 'city' as const,
    coordinates: { lat: 0, lng: 0, radius: 5 },
    metadata: {}
  });

  useEffect(() => {
    loadGeoZones();
  }, []);

  const loadGeoZones = async () => {
    setLoading(true);
    try {
      const data = await AdvancedTargetingService.getGeoZones();
      
      // Convert Supabase data to proper TypeScript types
      const convertedData: GeoTargetingZone[] = (data || []).map(zone => ({
        ...zone,
        type: zone.type as 'city' | 'postal_code' | 'radius' | 'region',
        coordinates: typeof zone.coordinates === 'string' ? JSON.parse(zone.coordinates) : zone.coordinates,
        polygons: typeof zone.polygons === 'string' ? JSON.parse(zone.polygons) : zone.polygons,
        metadata: typeof zone.metadata === 'string' ? JSON.parse(zone.metadata) : zone.metadata
      }));
      
      setZones(convertedData);
    } catch (error) {
      console.error('Error loading geo zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
    try {
      await AdvancedTargetingService.createGeoZone({
        ...newZone,
        is_active: true
      });
      
      setShowCreateForm(false);
      setNewZone({
        name: '',
        type: 'city',
        coordinates: { lat: 0, lng: 0, radius: 5 },
        metadata: {}
      });
      
      await loadGeoZones();
    } catch (error) {
      console.error('Error creating geo zone:', error);
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'radius': return Circle;
      case 'city': return MapPin;
      case 'region': return Map;
      default: return Globe;
    }
  };

  const getZoneTypeLabel = (type: string) => {
    switch (type) {
      case 'radius': return 'Zone circulaire';
      case 'city': return 'Ville';
      case 'postal_code': return 'Code postal';
      case 'region': return 'Région';
      default: return type;
    }
  };

  // Calculate zone counts properly
  const radiusZones = zones.filter(z => z.type === 'radius');
  const cityZones = zones.filter(z => z.type === 'city');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            Géofencing & Ciblage Géographique
          </h2>
          <p className="text-gray-600">Zones de ciblage géographique avancées</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle zone
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zones actives</p>
                <p className="text-2xl font-bold">{zones.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zones circulaires</p>
                <p className="text-2xl font-bold">{radiusZones.length}</p>
              </div>
              <Circle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Villes ciblées</p>
                <p className="text-2xl font-bold">{cityZones.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portée estimée</p>
                <p className="text-2xl font-bold">12.5K</p>
              </div>
              <Map className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une nouvelle zone de géociblage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zone-name">Nom de la zone</Label>
                <Input
                  id="zone-name"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  placeholder="Ex: Centre-ville Paris"
                />
              </div>
              
              <div>
                <Label htmlFor="zone-type">Type de zone</Label>
                <Select
                  value={newZone.type}
                  onValueChange={(value: any) => setNewZone({ ...newZone, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">Ville</SelectItem>
                    <SelectItem value="radius">Zone circulaire</SelectItem>
                    <SelectItem value="postal_code">Code postal</SelectItem>
                    <SelectItem value="region">Région</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newZone.type === 'radius' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    value={newZone.coordinates.lat}
                    onChange={(e) => setNewZone({
                      ...newZone,
                      coordinates: { ...newZone.coordinates, lat: parseFloat(e.target.value) }
                    })}
                    placeholder="48.8566"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    value={newZone.coordinates.lng}
                    onChange={(e) => setNewZone({
                      ...newZone,
                      coordinates: { ...newZone.coordinates, lng: parseFloat(e.target.value) }
                    })}
                    placeholder="2.3522"
                  />
                </div>
                
                <div>
                  <Label htmlFor="radius">Rayon (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={newZone.coordinates.radius}
                    onChange={(e) => setNewZone({
                      ...newZone,
                      coordinates: { ...newZone.coordinates, radius: parseFloat(e.target.value) }
                    })}
                    placeholder="5"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCreateZone}>
                Créer la zone
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des zones */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Chargement des zones...</div>
        ) : zones.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune zone de géociblage configurée</p>
              <p className="text-sm text-gray-500 mt-2">
                Créez votre première zone pour commencer le ciblage géographique
              </p>
            </CardContent>
          </Card>
        ) : (
          zones.map((zone) => {
            const IconComponent = getZoneIcon(zone.type);
            const isRadiusZone = zone.type === 'radius';
            
            return (
              <Card key={zone.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">{zone.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {getZoneTypeLabel(zone.type)}
                          </Badge>
                          {isRadiusZone && zone.coordinates && (
                            <Badge variant="secondary">
                              Rayon: {(zone.coordinates as any)?.radius || 0}km
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={zone.is_active ? "default" : "secondary"}>
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                  
                  {isRadiusZone && zone.coordinates && (
                    <div className="mt-4 text-sm text-gray-600">
                      Centre: {(zone.coordinates as any)?.lat?.toFixed(4) || 0}, {(zone.coordinates as any)?.lng?.toFixed(4) || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GeoTargetingManager;
