
import { BusinessData, ClassificationResult } from './types.ts';
import { repairKeywords, excludeKeywords } from './constants.ts';

export const classifyRepairer = (businessData: BusinessData): ClassificationResult => {
  const businessText = `${businessData.name} ${businessData.description || ''} ${businessData.category || ''}`.toLowerCase();
  
  // Mots-clés de réparation étendus pour être moins restrictif
  const extendedRepairKeywords = [
    ...repairKeywords,
    'tech', 'mobile', 'gsm', 'phone', 'iphone', 'samsung', 'clinic', 'center', 'centre',
    'solutions', 'service', 'express', 'fix', 'repair', 'doctor', 'care'
  ];
  
  const hasRepairKeywords = extendedRepairKeywords.some(keyword => businessText.includes(keyword));
  const hasExcludeKeywords = excludeKeywords.some(keyword => businessText.includes(keyword));
  
  // Classification plus permissive pour les vrais réparateurs
  const isRepairer = hasRepairKeywords && !hasExcludeKeywords;
  const confidence = isRepairer ? 0.9 : 0.1; // Confiance plus élevée pour les matches
  
  return {
    is_repairer: isRepairer,
    confidence: confidence,
    services: isRepairer ? ['Réparation smartphone', 'Réparation électronique'] : [],
    specialties: isRepairer ? ['iPhone', 'Samsung', 'Android'] : [],
    price_range: 'medium',
    is_open: true
  };
};
