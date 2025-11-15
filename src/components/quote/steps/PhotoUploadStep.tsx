import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';

export const PhotoUploadStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
}> = ({ data, onChange }) => {
  const photos = data.photos || [];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange({ photos: [...photos, ...acceptedFiles].slice(0, 5) });
  }, [photos, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 5,
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_: any, i: number) => i !== index);
    onChange({ photos: newPhotos });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Photos de l'appareil (optionnel)</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Des photos claires aident les réparateurs à établir un devis plus précis
        </p>
      </div>

      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-muted-foreground">Déposez les photos ici...</p>
          ) : (
            <>
              <p className="text-sm font-medium mb-2">
                Glissez vos photos ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum 5 photos • PNG, JPG, JPEG, WebP
              </p>
            </>
          )}
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {photos.map((photo: File, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
