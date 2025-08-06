
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RepairerProfile } from '@/types/repairerProfile';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateSEOOptimizedDescription } from '@/utils/seoDescriptionGenerator';

interface SEODescriptionSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const SEODescriptionSection: React.FC<SEODescriptionSectionProps> = ({ formData, setFormData }) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    console.log('🔍 Current formData for description generation:', {
      business_name: formData.business_name,
      repair_types: formData.repair_types,
      repair_types_length: formData.repair_types?.length || 0
    });

    // Validation améliorée avec des messages plus précis
    if (!formData.business_name || formData.business_name.trim() === '') {
      alert('Veuillez remplir le nom commercial avant de générer une description.');
      return;
    }

    if (!formData.repair_types || formData.repair_types.length === 0) {
      alert('Veuillez sélectionner au moins un type de réparation avant de générer une description.');
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      const selectedDescription = await generateSEOOptimizedDescription(formData);
      setFormData(prev => ({ ...prev, description: selectedDescription }));
    } catch (error) {
      console.error('Erreur lors de la génération de la description SEO:', error);
      alert('Erreur lors de la génération de la description. Veuillez réessayer.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="description">Description SEO</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerateDescription}
          disabled={isGeneratingDescription}
          className="flex items-center gap-2"
        >
          {isGeneratingDescription ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGeneratingDescription ? 'Génération SEO...' : 'Générer avec IA SEO'}
        </Button>
      </div>
      <Textarea
        id="description"
        value={formData.description || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        rows={6}
        placeholder="Décrivez votre activité, vos spécialités..."
      />
      
      {/* Debug info - à supprimer après résolution */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        Debug: Nom commercial: "{formData.business_name}" | Types de réparation: {formData.repair_types?.length || 0} sélectionnés
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <p className="font-medium text-blue-800 mb-2">🚀 Génération IA Optimisée SEO</p>
        <p className="text-blue-700">
          Notre IA génère automatiquement une description optimisée pour les moteurs de recherche en utilisant :
        </p>
        <ul className="list-disc list-inside text-blue-600 mt-1 space-y-1">
          <li><strong>Mots-clés géolocalisés</strong> : intègre votre ville et région</li>
          <li><strong>Mots-clés longue traîne</strong> : phrases spécifiques recherchées par vos clients</li>
          <li><strong>Signaux de confiance</strong> : met en avant certifications, expérience, garanties</li>
          <li><strong>Structure optimisée</strong> : titre accrocheur, services détaillés, call-to-action</li>
          <li><strong>Contenu unique</strong> : 3 variantes pour éviter le duplicate content</li>
        </ul>
        <p className="text-blue-600 mt-2 font-medium">
          💡 Astuce : Remplissez d'abord tous vos services et informations pour une description encore plus riche !
        </p>
      </div>
    </div>
  );
};

export default SEODescriptionSection;
