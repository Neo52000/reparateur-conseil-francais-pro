
export interface Enseigne {
  id: string;
  label: string;
  pattern: string;
}

export const ENSEIGNES_CONNUES: Enseigne[] = [
  { id: 'save', label: 'SAVE', pattern: 'SAVE' },
  { id: 'point-service-mobiles', label: 'Point Service Mobiles', pattern: 'POINT SERVICE MOBIL' },
  { id: 'cash-express', label: 'Cash Express', pattern: 'CASH EXPRESS' },
  { id: 'cash-and-repair', label: 'Cash And Repair', pattern: 'CASH AND REPAIR' },
  { id: 'wefix', label: 'WeFix', pattern: 'WEFIX' },
  { id: 'docteur-it', label: 'Docteur IT', pattern: 'DOCTEUR IT' },
  { id: 'bouygues', label: 'Bouygues Telecom', pattern: 'BOUYGUES' },
  { id: 'sfr', label: 'SFR', pattern: 'SFR' },
  { id: 'orange', label: 'Orange', pattern: 'ORANGE' },
  { id: 'amplifon', label: 'Amplifon', pattern: 'AMPLIFON' },
  { id: 'laparaphonie', label: 'La Paraphonie Leclerc', pattern: 'PARAPHONIE' },
  { id: 'leclerc', label: 'Leclerc', pattern: 'LECLERC' },
];

/**
 * Détecte l'enseigne à partir du nom du réparateur
 */
export const detectEnseigne = (name: string): string => {
  if (!name) return 'Indépendant';
  
  const upperName = name.toUpperCase();
  for (const enseigne of ENSEIGNES_CONNUES) {
    if (upperName.includes(enseigne.pattern)) {
      return enseigne.label;
    }
  }
  return 'Indépendant';
};
