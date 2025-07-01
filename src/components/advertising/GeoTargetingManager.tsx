
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Globe, MapPin, Target, Trash2 } from 'lucide-react';
import { GeoTargetingZone } from '@/types/advancedAdvertising';
import { AdvancedTargetingService } from '@/services/advancedTargeting';
import { toast } from 'sonner';

const GeoTargetingManager: React.FC = () => {
  const [zones, setZones] = useState<GeoTargetingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'city' as 'city' | 'postal_code' | 'radius' | 'region',
    coordinates: {
      lat: 48.8566,  // Paris par défaut
      lng: 2.3522,
      radius: 10
    },
    metadata: {}
  });

  const zoneTypes = [
    {
      value: 'city',
      label: 'Ville',
      description: 'Ciblage par ville',
      icon: '🏙️'
    },
    {
      value: 'postal_code',
      label: 'Code postal',
      description: 'Ciblage par code postal',
      icon: '📮'
    },
    {
      value: 'radius',
      label: 'Zone circulaire',
      description: 'Rayon autour d\'un point',
      icon: '⭕'
    },
    {
      value: 'region',
      label: 'Région',
      description: 'Ciblage régional',
      icon: '🗺️'
    }
  ];

  const popularCities = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
    { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
    { name: 'Nice', lat: 43.7102, lng: 7.2620 },
    { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
    { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
    { name: 'Montpellier', lat: 43.6110, lng: 3.8767 }
  ];

  useEffect(() => {
    fetchGeoZones();
  }, []);

  const fetchGeoZones = async () => {
    try {
      setLoading(true);
      const data = await AdvancedTargetingService.getGeoZones();
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching geo zones:', error);
      toast.error('Erreur lors du chargement des zones');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await AdvancedTargetingService.createGeoZone({
        ...formData,
        is_active: true
      });
      
      toast.success('Zone géographique créée');
      resetForm();
      fetchGeoZones();
    } catch (error) {
      console.error('Error saving geo zone:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'city',
      coordinates: {
        lat: 48.8566,
        lng: 2.3522,
        radius: 10
      },
      metadata: {}
    });
    setShowForm(false);
  };

  const setQuickCity = (city: typeof popularCities[0]) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        lat: city.lat,
        lng: city.lng
      }
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            Géofencing & Ciblage Géographique
            <Badge variant="secondary">Beta</Badge>
          </h2>
          <p className="text-gray-600">Créez des zones de ciblage géographique précises</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
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
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Villes ciblées</p>
                <p className="text-2xl font-bold">{zones.filter(z => z.type === 'city').length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zones circulaires</p>
                <p className="text-2xl font-bold">{zones.filter(z => z.type === 'radius').length}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portée estimée</p>
                <p className="text-2xl font-bold">~125k</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle zone de ciblage géographique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de la zone</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Centre-ville Paris"
              />
            </div>

            <div>
              <Label htmlFor="type">Type de zone</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zoneTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'radius' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.0001"
                      value={formData.coordinates.lat}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.0001"
                      value={formData.coordinates.lng}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) }
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="radius">Rayon (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.coordinates.radius}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        coordinates: { ...prev.coordinates, radius: parseInt(e.target.value) }
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>Villes populaires (raccourcis)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularCities.map(city => (
                      <Button
                        key={city.name}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickCity(city)}
                      >
                        {city.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                Créer la zone
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des zones */}
      <div className="grid gap-4">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">{zone.name}</h3>
                    <Badge variant="outline">
                      {zoneTypes.find(t => t.value === zone.type)?.icon} {zoneTypes.find(t => t.value === zone.type)?.label}
                    </Badge>
                    <Badge variant={zone.is_active ? "default" : "secondary"}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {zone.type === 'radius' && zone.coordinates && (
                      <>
                        <span>📍 {zone.coordinates.lat.toFixed(4)}, {zone.coordinates.lng.toFixed(4)}</span>
                        <span>⭕ Rayon: {zone.coordinates.radius}km</span>
                      </>
                    )}
                    <span>📅 Créé: {new Date(zone.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {zones.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune zone géographique configurée.</p>
            <Button onClick={() => setShowForm(true)}>
              Créer votre première zone
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeoTargetingManager;
