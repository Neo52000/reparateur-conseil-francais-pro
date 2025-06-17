
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

export const repairKeywords = [
  'réparation', 'repair', 'iphone', 'samsung', 'smartphone', 'téléphone', 'mobile',
  'écran', 'batterie', 'déblocage', 'gsm', 'phone', 'tablet', 'tablette',
  'service', 'dépannage', 'techfix', 'doctor', 'fix', 'clinic', 'express',
  'apple', 'android', 'huawei', 'xiaomi', 'oppo', 'oneplus', 'nokia',
  'vitre', 'casse', 'cassé', 'fissure', 'micro', 'haut-parleur', 'caméra'
];

export const excludeKeywords = [
  'boulangerie', 'restaurant', 'coiffeur', 'médecin', 'avocat', 'pharmacie',
  'immobilier', 'assurance', 'banque', 'école', 'formation', 'vêtement',
  'automobile', 'garage', 'plombier', 'électricien', 'maçon', 'peintre'
];
