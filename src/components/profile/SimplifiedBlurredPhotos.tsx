
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Images, Image, Lock } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface SimplifiedBlurredPhotosProps {
  profile: RepairerProfile;
}

const SimplifiedBlurredPhotos: React.FC<SimplifiedBlurredPhotosProps> = ({
  profile
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <Images className="h-6 w-6 mr-2 text-blue-600" />
        Galerie photo
      </h2>
      
      <div className="relative">
        {profile.shop_photos && profile.shop_photos.length > 0 ? (
          <div className="filter blur-sm pointer-events-none select-none opacity-60">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.shop_photos.slice(0, 6).map((photoUrl, index) => (
                <Card key={`blurred-photo-${index}`} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={`Photo floutée ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="filter blur-sm pointer-events-none select-none opacity-60">
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Photos de l'atelier</p>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Photos masquées</p>
            <p className="text-gray-500 text-sm">Revendiquez cette fiche pour voir les photos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedBlurredPhotos;
