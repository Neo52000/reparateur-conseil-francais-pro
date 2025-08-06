
import { RepairerProfile } from '@/types/repairerProfile';

export const generateSEOOptimizedDescription = async (formData: RepairerProfile): Promise<string> => {
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

  // Define warranty labels mapping
  const warrantyLabels: Record<string, string> = {
    '3_mois': '3 mois de garantie',
    '6_mois': '6 mois de garantie',
    '1_an': '1 an de garantie',
    '2_ans': '2 ans de garantie'
  };

  if (formData.warranty_duration) {
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

  return selectedDescription;
};
