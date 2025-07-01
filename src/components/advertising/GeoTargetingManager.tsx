
import React, { useState, useEffect } from 'react';
import { AdvancedTargetingService } from '@/services/advancedTargeting';
import { GeoTargetingZone } from '@/types/advancedAdvertising';
import GeoTargetingHeader from './geo-targeting/GeoTargetingHeader';
import GeoTargetingStats from './geo-targeting/GeoTargetingStats';
import GeoZoneCreateForm from './geo-targeting/GeoZoneCreateForm';
import GeoZonesList from './geo-targeting/GeoZonesList';

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

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewZone({
      name: '',
      type: 'city',
      coordinates: { lat: 0, lng: 0, radius: 5 },
      metadata: {}
    });
  };

  return (
    <div className="space-y-6">
      <GeoTargetingHeader onCreateZone={() => setShowCreateForm(true)} />
      
      <GeoTargetingStats zones={zones} />

      {showCreateForm && (
        <GeoZoneCreateForm
          newZone={newZone}
          setNewZone={setNewZone}
          onCreateZone={handleCreateZone}
          onCancel={handleCancelCreate}
        />
      )}

      <GeoZonesList zones={zones} loading={loading} />
    </div>
  );
};

export default GeoTargetingManager;
