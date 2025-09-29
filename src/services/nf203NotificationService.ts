import { supabase } from '@/integrations/supabase/client';

export class NF203NotificationService {
  static async sendComplianceNotification(
    userId: string,
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        message,
        type: `nf203_${type}`,
        data: data || {},
        is_read: false
      }]);

    if (error) throw error;
  }

  static async sendPeriodClosureNotification(
    repairerId: string,
    closureData: {
      period_start: string;
      period_end: string;
      total_invoices: number;
      period_hash: string;
    }
  ): Promise<void> {
    await this.sendComplianceNotification(
      repairerId,
      'success',
      '✅ Clôture de période réussie',
      `La période du ${new Date(closureData.period_start).toLocaleDateString('fr-FR')} au ${new Date(closureData.period_end).toLocaleDateString('fr-FR')} a été clôturée avec succès. ${closureData.total_invoices} factures archivées.`,
      { ...closureData, category: 'period_closure' }
    );
  }

  static async sendChainIntegrityAlert(
    repairerId: string,
    integrityReport: {
      is_valid: boolean;
      total_invoices: number;
      broken_links?: number;
      error_details?: string;
    }
  ): Promise<void> {
    if (!integrityReport.is_valid) {
      await this.sendComplianceNotification(
        repairerId,
        'error',
        '🔴 Alerte: Intégrité de la chaîne compromise',
        `La chaîne cryptographique de vos factures présente ${integrityReport.broken_links} anomalie(s). Action immédiate requise.`,
        { ...integrityReport, category: 'chain_integrity', urgent: true }
      );
    }
  }

  static async sendFECExportNotification(
    repairerId: string,
    fecPath: string,
    period: { start: string; end: string }
  ): Promise<void> {
    await this.sendComplianceNotification(
      repairerId,
      'info',
      '📄 Export FEC disponible',
      `Votre fichier FEC pour la période ${new Date(period.start).toLocaleDateString('fr-FR')} - ${new Date(period.end).toLocaleDateString('fr-FR')} est prêt.`,
      { fec_path: fecPath, period, category: 'fec_export' }
    );
  }

  static async sendArchiveNotification(
    repairerId: string,
    archiveId: string,
    archiveType: string
  ): Promise<void> {
    await this.sendComplianceNotification(
      repairerId,
      'info',
      '🗄️ Archive créée',
      `Une nouvelle archive ${archiveType} a été créée et sécurisée pour conservation légale.`,
      { archive_id: archiveId, archive_type: archiveType, category: 'archive' }
    );
  }

  static async sendClosureReminder(
    repairerId: string,
    daysUntilDue: number,
    lastClosureDate?: string
  ): Promise<void> {
    const message = lastClosureDate
      ? `Il reste ${daysUntilDue} jours avant la clôture recommandée. Dernière clôture : ${new Date(lastClosureDate).toLocaleDateString('fr-FR')}`
      : `Il reste ${daysUntilDue} jours avant la date de clôture recommandée.`;

    await this.sendComplianceNotification(
      repairerId,
      'warning',
      '⏰ Rappel: Clôture de période approchant',
      message,
      { days_until_due: daysUntilDue, last_closure: lastClosureDate, category: 'closure_reminder' }
    );
  }

  static async sendArchiveExpiryWarning(
    repairerId: string,
    archiveId: string,
    daysUntilExpiry: number
  ): Promise<void> {
    await this.sendComplianceNotification(
      repairerId,
      'warning',
      '⚠️ Archive proche de l\'expiration',
      `Une archive arrive à expiration dans ${daysUntilExpiry} jours. Vérifiez si une conservation légale est nécessaire.`,
      { archive_id: archiveId, days_until_expiry: daysUntilExpiry, category: 'archive_expiry' }
    );
  }

  static async sendLowComplianceWarning(
    repairerId: string,
    complianceRate: number
  ): Promise<void> {
    await this.sendComplianceNotification(
      repairerId,
      'warning',
      '📉 Taux de conformité faible',
      `Votre taux de conformité NF203 est de ${complianceRate.toFixed(1)}%. Un taux supérieur à 95% est recommandé.`,
      { compliance_rate: complianceRate, category: 'compliance_rate', action_required: true }
    );
  }
}
