import { supabase } from '@/integrations/supabase/client';
import { NF203ChainService } from './nf203ChainService';

export interface ComplianceReport {
  id: string;
  repairer_id: string;
  report_type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period_start: string;
  period_end: string;
  total_invoices: number;
  chained_invoices: number;
  compliance_rate: number;
  chain_integrity_checks: any[];
  periods_closed: number;
  archives_created: number;
  fec_exports: number;
  alerts_count: number;
  report_data: any;
  pdf_path?: string;
  generated_at: string;
  sent_at?: string;
}

export class NF203ReportService {
  static async generateMonthlyReport(
    repairerId: string,
    month: number,
    year: number
  ): Promise<ComplianceReport> {
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    return await this.generateReport(repairerId, 'monthly', periodStart, periodEnd);
  }

  static async generateQuarterlyReport(
    repairerId: string,
    quarter: number,
    year: number
  ): Promise<ComplianceReport> {
    const startMonth = (quarter - 1) * 3;
    const periodStart = new Date(year, startMonth, 1);
    const periodEnd = new Date(year, startMonth + 3, 0);

    return await this.generateReport(repairerId, 'quarterly', periodStart, periodEnd);
  }

  static async generateAnnualReport(
    repairerId: string,
    year: number
  ): Promise<ComplianceReport> {
    const periodStart = new Date(year, 0, 1);
    const periodEnd = new Date(year, 11, 31);

    return await this.generateReport(repairerId, 'annual', periodStart, periodEnd);
  }

  private static async generateReport(
    repairerId: string,
    reportType: 'monthly' | 'quarterly' | 'annual' | 'custom',
    periodStart: Date,
    periodEnd: Date
  ): Promise<ComplianceReport> {
    // Récupérer les stats de conformité
    const stats = await NF203ChainService.getComplianceStats(repairerId);

    // Compter les factures de la période
    const { count: totalInvoices } = await supabase
      .from('electronic_invoices')
      .select('*', { count: 'exact', head: true })
      .eq('repairer_id', repairerId)
      .gte('invoice_date', periodStart.toISOString())
      .lte('invoice_date', periodEnd.toISOString());

    // Compter les factures chaînées
    const { count: chainedInvoices } = await supabase
      .from('electronic_invoices_chain')
      .select('*', { count: 'exact', head: true })
      .eq('repairer_id', repairerId)
      .gte('chained_at', periodStart.toISOString())
      .lte('chained_at', periodEnd.toISOString());

    // Compter les archives créées
    const { count: archivesCreated } = await supabase
      .from('nf203_archives')
      .select('*', { count: 'exact', head: true })
      .eq('repairer_id', repairerId)
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    // Compter les clôtures
    const { count: periodsClosed } = await supabase
      .from('nf203_period_closures')
      .select('*', { count: 'exact', head: true })
      .eq('repairer_id', repairerId)
      .gte('closure_date', periodStart.toISOString())
      .lte('closure_date', periodEnd.toISOString());

    // Compter les alertes
    const { count: alertsCount } = await supabase
      .from('nf203_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('repairer_id', repairerId)
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    const complianceRate = totalInvoices ? (chainedInvoices || 0) / totalInvoices * 100 : 100;

    const reportData = {
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      },
      statistics: {
        total_invoices: totalInvoices || 0,
        chained_invoices: chainedInvoices || 0,
        compliance_rate: complianceRate,
        archives_created: archivesCreated || 0,
        periods_closed: periodsClosed || 0,
        alerts_count: alertsCount || 0
      },
      compliance_status: stats,
      generated_at: new Date().toISOString()
    };

    // Insérer le rapport
    const { data, error } = await supabase
      .from('nf203_compliance_reports')
      .insert([{
        repairer_id: repairerId,
        report_type: reportType,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        total_invoices: totalInvoices || 0,
        chained_invoices: chainedInvoices || 0,
        compliance_rate: complianceRate,
        periods_closed: periodsClosed || 0,
        archives_created: archivesCreated || 0,
        fec_exports: 0,
        alerts_count: alertsCount || 0,
        report_data: reportData
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getReports(repairerId: string): Promise<ComplianceReport[]> {
    const { data, error } = await supabase
      .from('nf203_compliance_reports')
      .select('*')
      .eq('repairer_id', repairerId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getReport(reportId: string): Promise<ComplianceReport | null> {
    const { data, error } = await supabase
      .from('nf203_compliance_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) throw error;
    return data;
  }

  static async exportReportToJSON(reportId: string): Promise<string> {
    const report = await this.getReport(reportId);
    if (!report) throw new Error('Rapport non trouvé');

    return JSON.stringify(report, null, 2);
  }
}
