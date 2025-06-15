
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RepairerProfile } from '@/types/repairerProfile';
import { Sparkles, Loader2 } from 'lucide-react';

interface BasicInfoSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, setFormData }) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateDescription = async () => {
    if (!formData.business_name || !formData.repair_types.length) {
      alert('Veuillez remplir le nom commercial et sélectionner au moins un type de réparation avant de générer une description.');
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      // Simulate AI description generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const repairTypesText = formData.repair_types.map(type => {
        const labels: Record<string, string> = {
          telephone: 'téléphones',
          montre: 'montres',
          console: 'consoles de jeu',
          ordinateur: 'ordinateurs',
          autres: 'autres appareils électroniques'
        };
        return labels[type] || type;
      }).join(', ');

      const generatedDescription = `${formData.business_name} est spécialisé dans la réparation de ${repairTypesText}. Notre équipe expérimentée vous propose des services de qualité avec des pièces d'origine. Nous nous engageons à vous offrir un service rapide, fiable et à prix compétitif. Diagnostic gratuit et devis transparent pour tous vos appareils.`;

      setFormData(prev => ({ ...prev, description: generatedDescription }));
    } catch (error) {
      console.error('Erreur lors de la génération de la description:', error);
      alert('Erreur lors de la génération de la description. Veuillez réessayer.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business_name">Nom commercial *</Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret_number">N° SIRET</Label>
          <Input
            id="siret_number"
            value={formData.siret_number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, siret_number: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateDescription}
            disabled={isGeneratingDescription}
            className="flex items-center gap-2"
          >
            {isGeneratingDescription ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGeneratingDescription ? 'Génération...' : 'Générer avec IA'}
          </Button>
        </div>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          placeholder="Décrivez votre activité, vos spécialités..."
        />
        <p className="text-sm text-gray-500">
          💡 <strong>Astuce :</strong> Cliquez sur "Générer avec IA" pour obtenir une description automatique basée sur votre nom commercial et vos services. Vous pourrez ensuite la modifier selon vos besoins.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_qualirepar_label"
            checked={formData.has_qualirepar_label}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_qualirepar_label: checked as boolean }))}
          />
          <Label htmlFor="has_qualirepar_label">Label QualiRépar</Label>
        </div>
        <p className="text-sm text-gray-600">
          Le label QualiRépar est une certification officielle qui garantit la qualité des services de réparation. 
          Cochez cette case uniquement si vous possédez effectivement cette certification.
        </p>
      </div>
    </>
  );
};

export default BasicInfoSection;
