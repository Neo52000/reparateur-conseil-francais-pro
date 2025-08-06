
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RepairerProfile } from '@/types/repairerProfile';
import { X, Image, Upload } from 'lucide-react';

interface PhotosSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ formData, setFormData }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    console.log('📁 Files selected:', files.length);

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          console.log('📸 File converted to data URL:', file.name);
          
          setFormData(prev => ({
            ...prev,
            shop_photos: [...(prev.shop_photos || []), dataUrl]
          }));
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    console.log('🗑️ Removing photo at index:', index);
    const updatedPhotos = (formData.shop_photos || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, shop_photos: updatedPhotos }));
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
        {/* Upload depuis le disque dur */}
        <div className="space-y-2">
          <Label htmlFor="photo_files">Télécharger des photos depuis votre ordinateur</Label>
          <div className="flex items-center gap-2">
            <Input
              id="photo_files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <Button type="button" variant="outline" onClick={() => document.getElementById('photo_files')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Parcourir
            </Button>
          </div>
          <p className="text-xs text-gray-500">Formats acceptés : JPG, PNG, GIF. Plusieurs fichiers possibles.</p>
        </div>

        {formData.shop_photos && formData.shop_photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.shop_photos.map((photoUrl, index) => (
              <Card key={`photo-${index}-${photoUrl.substring(0, 20)}`} className="relative group">
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
                    {photoUrl.startsWith('data:') ? `Image locale ${index + 1}` : photoUrl}
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
            <p className="text-sm text-gray-400">Téléchargez des photos pour mettre en valeur votre activité</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosSection;
