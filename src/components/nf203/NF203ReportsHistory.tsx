import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { NF203ReportService } from '@/services/nf203ReportService';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface NF203ReportsHistoryProps {
  repairerId: string;
}

export function NF203ReportsHistory({ repairerId }: NF203ReportsHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['nf203-reports', repairerId],
    queryFn: () => NF203ReportService.getReports(repairerId)
  });

  const generateMonthlyMutation = useMutation({
    mutationFn: () => {
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return NF203ReportService.generateMonthlyReport(repairerId, lastMonth, year);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf203-reports'] });
      toast({
        title: 'Rapport généré',
        description: 'Le rapport mensuel a été généré avec succès',
      });
    }
  });

  const generateQuarterlyMutation = useMutation({
    mutationFn: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3) || 4;
      const year = quarter === 4 ? now.getFullYear() - 1 : now.getFullYear();
      return NF203ReportService.generateQuarterlyReport(repairerId, quarter, year);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf203-reports'] });
      toast({
        title: 'Rapport généré',
        description: 'Le rapport trimestriel a été généré avec succès',
      });
    }
  });

  const generateAnnualMutation = useMutation({
    mutationFn: () => {
      const year = new Date().getFullYear() - 1;
      return NF203ReportService.generateAnnualReport(repairerId, year);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf203-reports'] });
      toast({
        title: 'Rapport généré',
        description: 'Le rapport annuel a été généré avec succès',
      });
    }
  });

  const handleGenerate = () => {
    switch (selectedPeriod) {
      case 'monthly':
        generateMonthlyMutation.mutate();
        break;
      case 'quarterly':
        generateQuarterlyMutation.mutate();
        break;
      case 'annual':
        generateAnnualMutation.mutate();
        break;
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const data = await NF203ReportService.exportReportToJSON(reportId);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-nf203-${reportId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Téléchargement réussi',
        description: 'Le rapport a été téléchargé',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le rapport',
        variant: 'destructive'
      });
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      annual: 'Annuel',
      custom: 'Personnalisé'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rapports de conformité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapports de conformité
          </span>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="quarterly">Trimestriel</SelectItem>
                <SelectItem value="annual">Annuel</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={generateMonthlyMutation.isPending || generateQuarterlyMutation.isPending || generateAnnualMutation.isPending}>
              Générer un rapport
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        Rapport {getReportTypeLabel(report.report_type)}
                      </p>
                      <Badge variant="outline">{report.compliance_rate.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.period_start).toLocaleDateString('fr-FR')} - {new Date(report.period_end).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {report.total_invoices} factures
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(report.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun rapport disponible</p>
            <p className="text-sm">Générez votre premier rapport de conformité</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
