
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

  const generateSEOOptimizedDescription = async () => {
    if (!formData.business_name || !formData.repair_types.length) {
      alert('Veuillez remplir le nom commercial et sélectionner au moins un type de réparation avant de générer une description.');
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      // Simulate AI description generation with SEO optimization
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Phase 1: Create structured SEO data
      const repairTypesLabels: Record<string, string> = {
        telephone: 'téléphones portables et smartphones',
        montre: 'montres connectées et traditionnelles',
        console: 'consoles de jeu PlayStation, Xbox, Nintendo',
        ordinateur: 'ordinateurs portables et PC fixes',
        autres: 'appareils électroniques et multimédia'
      };

      const repairTypesText = formData.repair_types
        .map(type => repairTypesLabels[type] || type)
        .join(', ');

      // Phase 2: Generate location-based keywords
      const locationKeywords = formData.city ? 
        [`${formData.city}`, `région de ${formData.city}`, `proche de ${formData.city}`] :
        ['votre région'];

      // Phase 3: Create trust signals
      const trustSignals = [];
      if (formData.has_qualirepar_label) {
        trustSignals.push('certifié QualiRépar');
      }
      if (formData.years_experience && formData.years_experience > 0) {
        trustSignals.push(`${formData.years_experience} ans d'expérience`);
      }
      if (formData.warranty_duration) {
        const warrantyLabels: Record<string, string> = {
          '3_mois': '3 mois de garantie',
          '6_mois': '6 mois de garantie',
          '1_an': '1 an de garantie',
          '2_ans': '2 ans de garantie'
        };
        trustSignals.push(warrantyLabels[formData.warranty_duration] || 'garantie incluse');
      }

      // Phase 4: Create service highlights
      const serviceHighlights = [];
      if (formData.emergency_service) serviceHighlights.push('intervention d\'urgence');
      if (formData.home_service) serviceHighlights.push('réparation à domicile');
      if (formData.pickup_service) serviceHighlights.push('service de collecte');
      if (formData.pricing_info?.free_quote) serviceHighlights.push('devis gratuit');

      // Phase 5: Generate multiple description variants and select one
      const descriptionVariants = [
        // Variant 1: Professional and comprehensive
        `**${formData.business_name} - Réparation ${repairTypesText} ${locationKeywords[0] ? `à ${locationKeywords[0]}` : ''}**

Spécialiste de la réparation ${repairTypesText}, ${formData.business_name} vous accompagne pour remettre en état vos appareils avec professionnalisme et expertise. ${trustSignals.length > 0 ? `Notre atelier ${trustSignals.join(', ')} ` : ''}vous garantit un service de qualité.

**Nos services de réparation :**
• Diagnostic approfondi et devis transparent
• Réparation avec pièces d'origine ou compatibles
• ${serviceHighlights.length > 0 ? serviceHighlights.join(', ') + '\n• ' : ''}Intervention rapide et soignée

${formData.city ? `Situé ${locationKeywords.join(', ')}, notre atelier ` : 'Notre atelier '}est facilement accessible et vous accueille pour tous vos besoins de réparation. ${formData.response_time ? `Temps de réponse : ${formData.response_time}.` : ''} 

Contactez-nous dès maintenant pour un diagnostic ${formData.pricing_info?.free_quote ? 'gratuit' : 'personnalisé'} !`,

        // Variant 2: Local and community-focused
        `${formData.business_name} : Votre expert en réparation ${repairTypesText} ${formData.city ? `à ${formData.city}` : 'dans votre région'} !

Technicien ${trustSignals.length > 0 ? trustSignals.join(' et ') + ', ' : ''}je répare vos ${repairTypesText} avec soin et précision. Mon atelier ${formData.city ? `situé à ${formData.city}` : 'local'} vous propose des solutions durables pour prolonger la vie de vos appareils.

🔧 **Pourquoi me choisir ?**
- Diagnostic professionnel et conseil personnalisé
- Réparations fiables avec ${formData.warranty_duration ? warrantyLabels[formData.warranty_duration] || 'garantie' : 'garantie qualité'}
- ${serviceHighlights.length > 0 ? serviceHighlights.join(' et ') : 'Service flexible et adapté'}
- Prix transparents et compétitifs

Besoin d'une réparation ${repairTypesText} ${formData.city ? `à ${formData.city}` : ''} ? Contactez ${formData.business_name} pour un service professionnel et de confiance !`,

        // Variant 3: Technical and detailed
        `Réparation ${repairTypesText} ${formData.city ? `${formData.city} ` : ''}| ${formData.business_name} - Service Professionnel

${formData.business_name} est votre partenaire technique pour la réparation ${repairTypesText}. Notre expertise ${trustSignals.length > 0 ? `${trustSignals.join(', ')} ` : ''}nous permet de diagnostiquer et réparer efficacement tous types de pannes.

**Prestations techniques :**
• Diagnostic électronique approfondi
• Remplacement de composants défaillants
• Réparation écrans, batteries, connecteurs
• ${serviceHighlights.length > 0 ? serviceHighlights.join(', ') : 'Service personnalisé'}

Notre méthodologie rigoureuse et nos outils professionnels garantissent des réparations durables. ${formData.city ? `Basé à ${formData.city}, ` : ''}${formData.business_name} intervient rapidement pour remettre vos appareils en parfait état de fonctionnement.

Demandez votre ${formData.pricing_info?.free_quote ? 'devis gratuit' : 'estimation'} dès aujourd'hui !`
      ];

      // Select a random variant to avoid duplicate content
      const selectedDescription = descriptionVariants[Math.floor(Math.random() * descriptionVariants.length)];

      setFormData(prev => ({ ...prev, description: selectedDescription }));
    } catch (error) {
      console.error('Erreur lors de la génération de la description SEO:', error);
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
          <Label htmlFor="description">Description SEO</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateSEOOptimizedDescription}
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
          <span className="text-blue-600 font-medium"> ✓ Boost SEO garanti</span> - Cette certification sera mise en avant dans votre description générée par IA.
        </p>
      </div>
    </>
  );
};

export default BasicInfoSection;
