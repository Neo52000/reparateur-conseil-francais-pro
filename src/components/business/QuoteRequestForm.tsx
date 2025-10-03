import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Smartphone, Upload, AlertCircle, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { useToast } from '@/hooks/use-toast';

const quoteRequestSchema = z.object({
  deviceBrand: z.string().min(1, 'Sélectionnez une marque'),
  deviceModel: z.string().min(1, 'Sélectionnez un modèle'),
  issueType: z.string().min(1, 'Sélectionnez un type de problème'),
  description: z.string().min(10, 'Décrivez le problème (min. 10 caractères)'),
  urgency: z.enum(['low', 'medium', 'high']),
  name: z.string().min(2, 'Entrez votre nom'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide')
});

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

interface QuoteRequestFormProps {
  repairerId?: string;
  onSubmit: (data: QuoteRequestFormData & { images?: File[] }) => Promise<void>;
  onCancel?: () => void;
}

const DEVICE_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus', 'Google', 'Oppo', 'Autre'];
const ISSUE_TYPES = [
  'Écran cassé',
  'Batterie défectueuse',
  'Problème de charge',
  'Caméra',
  'Boutons',
  'Haut-parleur',
  'Microphone',
  'Problème logiciel',
  'Autre'
];

export const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  repairerId,
  onSubmit,
  onCancel
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      urgency: 'medium'
    }
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).slice(0, 3 - images.length);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: QuoteRequestFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, images });
      toast({
        title: 'Demande envoyée !',
        description: 'Vous recevrez une réponse dans les plus brefs délais.'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande. Réessayez.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Demande de devis</CardTitle>
              <CardDescription>
                Remplissez ce formulaire pour recevoir un devis personnalisé
              </CardDescription>
            </div>
          </div>
          <ProgressIndicator 
            value={progress} 
            variant="premium" 
            showLabel
            className="mt-4"
          />
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Step 1: Device Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="deviceBrand">Marque de l'appareil *</Label>
                  <Select
                    onValueChange={(value) => setValue('deviceBrand', value)}
                  >
                    <SelectTrigger id="deviceBrand">
                      <SelectValue placeholder="Sélectionnez une marque" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_BRANDS.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.deviceBrand && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.deviceBrand.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceModel">Modèle *</Label>
                  <Input
                    id="deviceModel"
                    placeholder="Ex: iPhone 13 Pro, Galaxy S21..."
                    {...register('deviceModel')}
                  />
                  {errors.deviceModel && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.deviceModel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueType">Type de problème *</Label>
                  <Select
                    onValueChange={(value) => setValue('issueType', value)}
                  >
                    <SelectTrigger id="issueType">
                      <SelectValue placeholder="Sélectionnez un problème" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map(issue => (
                        <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.issueType && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.issueType.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(2)}
                  className="w-full"
                >
                  Suivant
                </Button>
              </motion.div>
            )}

            {/* Step 2: Issue Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="description">Description du problème *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez en détail le problème rencontré..."
                    rows={4}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Urgence</Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'low', label: 'Basse', color: 'secondary' },
                      { value: 'medium', label: 'Moyenne', color: 'warning' },
                      { value: 'high', label: 'Haute', color: 'destructive' }
                    ].map(({ value, label, color }) => (
                      <Badge
                        key={value}
                        variant={watch('urgency') === value ? color as any : 'outline'}
                        className="cursor-pointer flex-1 justify-center py-2"
                        onClick={() => setValue('urgency', value as any)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Photos (optionnel, max 3)</Label>
                  <div className="flex gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Photo ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <label className="h-20 w-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep(3)}
                    className="flex-1"
                  >
                    Suivant
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    placeholder="Jean Dupont"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean.dupont@example.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 button-lift"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="mr-2"
                        >
                          ⏳
                        </motion.div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer la demande
                      </>
                    )}
                  </Button>
                </div>

                {onCancel && (
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full"
                  >
                    Annuler
                  </Button>
                )}
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
