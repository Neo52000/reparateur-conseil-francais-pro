
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RepairerProfile } from '@/types/repairerProfile';
import { Plus, X, Image } from 'lucide-react';

interface PhotosSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ formData, setFormData }) => {
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const addPhoto = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    console.log('🖼️ Adding photo:', newPhotoUrl);
    
    if (newPhotoUrl.trim()) {
      const updatedPhotos = [...(formData.shop_photos || []), newPhotoUrl.trim()];
      console.log('📸 Updated photos array:', updatedPhotos);
      
      setFormData(prev => ({ 
        ...prev, 
        shop_photos: updatedPhotos 
      }));
      setNewPhotoUrl('');
    }
  };

  const removePhoto = (index: number) => {
    console.log('🗑️ Removing photo at index:', index);
    const updatedPhotos = (formData.shop_photos || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, shop_photos: updatedPhotos }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPhoto(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Photos de votre boutique et services</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ajoutez des photos de votre boutique, de votre équipement et de vos réparations pour inspirer confiance à vos clients.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="photo_url">URL de la photo</Label>
            <Input
              id="photo_url"
              type="url"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="https://exemple.com/photo.jpg"
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex items-end">
            <Button 
              type="button" 
              onClick={addPhoto} 
              disabled={!newPhotoUrl.trim()}
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {formData.shop_photos && formData.shop_photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.shop_photos.map((photoUrl, index) => (
              <Card key={`photo-${index}-${photoUrl}`} className="relative group">
                <CardContent className="p-3">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <img
                      src={photoUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.classList.remove('hidden');
                        }
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center text-gray-400">
                      <Image className="h-8 w-8 mb-2" />
                      <span className="text-xs">Image introuvable</span>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 truncate" title={photoUrl}>
                    {photoUrl}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(!formData.shop_photos || formData.shop_photos.length === 0) && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune photo ajoutée</p>
            <p className="text-sm text-gray-400">Ajoutez des photos pour mettre en valeur votre activité</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosSection;
