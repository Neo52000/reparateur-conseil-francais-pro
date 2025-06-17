
import { BusinessData, ClassificationResult } from './types.ts';
import { repairKeywords, excludeKeywords } from './constants.ts';

export const classifyRepairer = (businessData: BusinessData): ClassificationResult => {
  const businessText = `${businessData.name} ${businessData.description || ''} ${businessData.category || ''}`.toLowerCase();
  
  const hasRepairKeywords = repairKeywords.some(keyword => businessText.includes(keyword));
  const hasExcludeKeywords = excludeKeywords.some(keyword => businessText.includes(keyword));
  
  return {
    is_repairer: hasRepairKeywords && !hasExcludeKeywords,
    confidence: hasRepairKeywords && !hasExcludeKeywords ? 0.8 : 0.2,
    services: hasRepairKeywords ? ['Réparation smartphone', 'Réparation électronique'] : [],
    specialties: hasRepairKeywords ? ['iPhone', 'Samsung', 'Android'] : [],
    price_range: 'medium',
    is_open: true
  };
};
