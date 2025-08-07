import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Filter, Star, MapPin, Phone, Mail } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/stores/mapStore';
import { useRealRepairers } from '@/hooks/useRealRepairers';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Repairer } from '@/types/repairer';

// Type adapter for RealRepairer to Repairer
interface RealRepairer {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  rating?: number;
  services: string[];
}
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapWithFiltersProps {
  onBack?: () => void;
}

// Custom icon for repairers
const createRepairerIcon = (rating?: number) => {
  const color = rating && rating >= 4.5 ? '#22c55e' : rating && rating >= 4 ? '#3b82f6' : '#f59e0b';
  return L.divIcon({
    html: `
      <div style="
        background: ${color}; 
        width: 28px; 
        height: 28px; 
        border-radius: 50%; 
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        color: white;
        font-weight: bold;
      ">
        📱
      </div>
    `,
    className: 'repairer-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Map controller to handle bounds and user location
const MapController: React.FC<{ repairers: any[], userLocation: [number, number] | null }> = ({ repairers, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (repairers.length > 0) {
      const validRepairers = repairers.filter(r => r.lat && r.lng);
      if (validRepairers.length > 0) {
        const bounds = L.latLngBounds(validRepairers.map(r => [r.lat, r.lng]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else if (userLocation) {
      map.setView(userLocation, 12);
    }
  }, [map, repairers, userLocation]);

  return null;
};

const InteractiveMapWithFilters: React.FC<InteractiveMapWithFiltersProps> = ({ onBack }) => {
  const [filters, setFilters] = useState({
    search: '',
    service: '',
    priceRange: '',
    minRating: 0,
    distance: 50,
    openNow: false
  });

  const [selectedRepairer, setSelectedRepairer] = useState<any | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const { repairers, loading, error } = useRealRepairers();
  const { userLocation, getUserLocation } = useGeolocation();

  // Filter repairers based on criteria
  const filteredRepairers = useMemo(() => {
    return repairers.filter(repairer => {
      // Search filter
      if (filters.search && !repairer.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !repairer.city.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Service filter
      if (filters.service && !repairer.services.some(service => 
        service.toLowerCase().includes(filters.service.toLowerCase()))) {
        return false;
      }

      // Rating filter
      if (filters.minRating > 0 && (!repairer.rating || repairer.rating < filters.minRating)) {
        return false;
      }

      // Price range filter (mock implementation)
      // Note: RealRepairer doesn't have price_range, so we skip this filter for now
      // if (filters.priceRange && repairer.price_range !== filters.priceRange) {
      //   return false;
      // }

      return true;
    });
  }, [repairers, filters]);

  const handleReservation = (repairer: any) => {
    setSelectedRepairer(repairer);
    setShowReservationForm(true);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Carte interactive des réparateurs</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Filtres</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Recherche</label>
                  <Input
                    placeholder="Nom ou ville..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Service</label>
                  <Select value={filters.service} onValueChange={(value) => setFilters(prev => ({ ...prev, service: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les services</SelectItem>
                      <SelectItem value="écran">Réparation écran</SelectItem>
                      <SelectItem value="batterie">Changement batterie</SelectItem>
                      <SelectItem value="vitre">Réparation vitre</SelectItem>
                      <SelectItem value="connecteur">Réparation connecteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Note minimum</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: value[0] }))}
                      max={5}
                      min={0}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-sm w-12">{filters.minRating}★</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gamme de prix</label>
                  <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les prix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les prix</SelectItem>
                      <SelectItem value="low">€ - Économique</SelectItem>
                      <SelectItem value="medium">€€ - Moyen</SelectItem>
                      <SelectItem value="high">€€€ - Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredRepairers.length} réparateur{filteredRepairers.length !== 1 ? 's' : ''} trouvé{filteredRepairers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Map and results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <Card className="p-0 overflow-hidden">
              <div className="h-96">
                <MapContainer
                  center={[46.8566, 2.3522]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapController repairers={filteredRepairers} userLocation={userLocation} />
                  
                  {filteredRepairers.map((repairer) => (
                    <Marker
                      key={repairer.id}
                      position={[repairer.lat, repairer.lng]}
                      icon={createRepairerIcon(repairer.rating)}
                    >
                      <Popup maxWidth={300}>
                        <div className="p-3">
                          <h3 className="font-semibold text-base mb-2">{repairer.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {repairer.address}, {repairer.city}
                          </p>
                          
                          {repairer.rating && (
                            <div className="flex items-center mb-2">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm">{repairer.rating}/5</span>
                            </div>
                          )}
                          
                          <div className="space-y-2 mb-3">
                            <p className="text-xs"><strong>Services:</strong> {repairer.services.slice(0, 2).join(', ')}</p>
                            {repairer.phone && (
                              <p className="text-xs">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {repairer.phone}
                              </p>
                            )}
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleReservation(repairer)}
                          >
                            Réserver
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>

            {/* Results list */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Liste des réparateurs</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredRepairers.map((repairer) => (
                  <div key={repairer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{repairer.name}</h4>
                        <p className="text-sm text-muted-foreground">{repairer.city}</p>
                        {repairer.rating && (
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{repairer.rating}/5</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleReservation(repairer)}
                      >
                        Réserver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Reservation Modal */}
        {showReservationForm && selectedRepairer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Réserver chez {selectedRepairer.name}
                </h3>
                <div className="space-y-4">
                  <Input placeholder="Votre nom" />
                  <Input placeholder="Votre téléphone" />
                  <Input placeholder="Description du problème" />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowReservationForm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button className="flex-1">
                      Confirmer
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMapWithFilters;