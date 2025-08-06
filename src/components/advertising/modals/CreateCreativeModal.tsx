
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload, FileText, Image, Video } from 'lucide-react';
import { CreateCreativeData } from '@/types/creatives';

interface CreateCreativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCreativeData) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}

const CreateCreativeModal: React.FC<CreateCreativeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpload
}) => {
  const [formData, setFormData] = useState<CreateCreativeData>({
    name: '',
    creative_type: 'image',
    creative_data: {},
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await onUpload(file);
      setFormData(prev => ({ ...prev, creative_url: url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        creative_type: 'image',
        creative_data: {},
        tags: [],
      });
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouveau créatif</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du créatif *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Bannière iPhone 15 Pro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de créatif</Label>
            <Select
              value={formData.creative_type}
              onValueChange={(value: 'image' | 'video' | 'text') => 
                setFormData(prev => ({ ...prev, creative_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vidéo
                  </div>
                </SelectItem>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Texte
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.creative_type !== 'text' && (
            <div className="space-y-2">
              <Label htmlFor="file">Fichier créatif</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  id="file"
                  accept={formData.creative_type === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Téléchargement...' : `Cliquez pour télécharger un fichier ${formData.creative_type}`}
                  </span>
                </label>
                {formData.creative_url && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Fichier téléchargé avec succès
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.creative_type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="content">Contenu textuel</Label>
              <Textarea
                id="content"
                value={formData.creative_data?.content || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  creative_data: { ...prev.creative_data, content: e.target.value }
                }))}
                placeholder="Saisissez votre contenu textuel..."
                rows={4}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Ajouter
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !formData.name}>
              {submitting ? 'Création...' : 'Créer le créatif'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCreativeModal;
