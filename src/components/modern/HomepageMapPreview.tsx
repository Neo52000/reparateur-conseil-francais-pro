import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRepairers } from '@/hooks/useRepairers';
import { useMapStore } from '@/stores/mapStore';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FRANCE_CENTER: [number, number] = [46.6, 2.4];
const FRANCE_ZOOM = 6;
const USER_ZOOM = 11;

const HomepageMapPreview = () => {
  const navigate = useNavigate();
  const { userLocation } = useMapStore();
  const { repairers, loading } = useRepairers();

  const markers = useMemo(
    () =>
      repairers
        .filter(r => typeof r.lat === 'number' && typeof r.lng === 'number' && !Number.isNaN(r.lat) && !Number.isNaN(r.lng))
        .slice(0, 20),
    [repairers]
  );

  const center = userLocation ?? FRANCE_CENTER;
  const zoom = userLocation ? USER_ZOOM : FRANCE_ZOOM;

  const openFullMap = (lat?: number, lng?: number) => {
    if (lat !== undefined && lng !== undefined) {
      navigate(`/search?view=map&lat=${lat}&lng=${lng}`);
    } else {
      navigate('/search?view=map');
    }
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full rounded-2xl"
        aria-label="Carte d'aperçu des réparateurs"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(r => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            eventHandlers={{
              click: () => openFullMap(r.lat, r.lng),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <strong className="block text-sm">{r.name}</strong>
                <span className="block text-xs text-muted-foreground">
                  {r.city}
                  {r.postal_code ? ` · ${r.postal_code}` : ''}
                </span>
                <Button
                  size="sm"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => openFullMap(r.lat, r.lng)}
                >
                  Voir sur la carte complète
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/30"
          role="status"
          aria-live="polite"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-sm shadow-elev-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Chargement des réparateurs…
          </div>
        </div>
      )}

      {!loading && markers.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-sm shadow-elev-2">
            <MapPin className="h-4 w-4" aria-hidden />
            Aucun réparateur géolocalisé pour le moment
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageMapPreview;
