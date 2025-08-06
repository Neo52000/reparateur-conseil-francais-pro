
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GeoZoneFormData {
  name: string;
  type: 'city' | 'postal_code' | 'radius' | 'region';
  coordinates: {
    lat: number;
    lng: number;
    radius: number;
  };
  metadata: Record<string, any>;
}

interface GeoZoneCreateFormProps {
  newZone: GeoZoneFormData;
  setNewZone: React.Dispatch<React.SetStateAction<GeoZoneFormData>>;
  onCreateZone: () => Promise<void>;
  onCancel: () => void;
}

const GeoZoneCreateForm: React.FC<GeoZoneCreateFormProps> = ({
  newZone,
  setNewZone,
  onCreateZone,
  onCancel
}) => {
  return (
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
          <Button onClick={onCreateZone}>
            Créer la zone
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeoZoneCreateForm;
