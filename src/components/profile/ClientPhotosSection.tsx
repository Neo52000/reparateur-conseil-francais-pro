
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Images, Image } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientPhotosSectionProps {
  profile: RepairerProfile;
}

const ClientPhotosSection: React.FC<ClientPhotosSectionProps> = ({ profile }) => {
  if (!profile.shop_photos || profile.shop_photos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Images className="h-6 w-6 mr-2 text-blue-600" />
            Galerie photos du réparateur
          </h2>
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune photo disponible</p>
            <p className="text-sm text-gray-400">Le réparateur n'a pas encore ajouté de photos de son atelier</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Images className="h-6 w-6 mr-2 text-blue-600" />
          Galerie photos du réparateur
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.shop_photos.map((photoUrl, index) => (
            <Card key={`shop-photo-${index}-${photoUrl.substring(0, 20)}`} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`Photo de l'atelier ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="hidden flex-col items-center justify-center text-gray-400 absolute inset-0 bg-gray-100">
                    <Image className="h-8 w-8 mb-2" />
                    <span className="text-xs">Image non disponible</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 truncate" title={photoUrl}>
                    {photoUrl.startsWith('data:') ? `Photo ${index + 1}` : `Photo de l'atelier ${index + 1}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientPhotosSection;
