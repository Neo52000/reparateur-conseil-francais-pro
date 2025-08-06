
import { CleanupOption } from '../types/historyTypes';

export const CLEANUP_OPTIONS: CleanupOption[] = [
  { value: 'older_than_day', label: 'Plus de 24h', description: 'Logs de plus de 24 heures' },
  { value: 'older_than_week', label: 'Plus de 7 jours', description: 'Logs de plus d\'une semaine' },
  { value: 'older_than_month', label: 'Plus de 30 jours', description: 'Logs de plus d\'un mois' },
  { value: 'failed_only', label: 'Échecs uniquement', description: 'Tous les logs en erreur' },
  { value: 'successful_only', label: 'Succès uniquement', description: 'Logs terminés avec succès' },
  { value: 'all', label: 'Tout l\'historique', description: 'Supprimer tous les logs' }
];
