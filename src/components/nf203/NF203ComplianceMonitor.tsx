import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNF203Chain } from '@/hooks/useNF203Chain';
import { Shield, CheckCircle, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface NF203ComplianceMonitorProps {
  repairerId: string;
}

export function NF203ComplianceMonitor({ repairerId }: NF203ComplianceMonitorProps) {
  const { 
    complianceStats, 
    isLoading, 
    verifyIntegrity, 
    isVerifying,
    exportCompliance,
    isExporting
  } = useNF203Chain(repairerId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = complianceStats;
  const isFullyCompliant = stats?.compliance_rate === 100 && 
                          stats?.chain_integrity?.is_valid;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Conformité NF203</CardTitle>
          </div>
          <Badge variant={isFullyCompliant ? 'default' : 'secondary'}>
            {isFullyCompliant ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Conforme
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                À vérifier
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Système de facturation électronique sécurisé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Factures totales</p>
            <p className="text-2xl font-bold">{stats?.total_invoices || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Factures chaînées</p>
            <p className="text-2xl font-bold">{stats?.chained_invoices || 0}</p>
          </div>
        </div>

        {/* Taux de conformité */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taux de conformité</span>
            <span className="font-semibold">{stats?.compliance_rate || 0}%</span>
          </div>
          <Progress value={stats?.compliance_rate || 0} className="h-2" />
        </div>

        {/* Intégrité de la chaîne */}
        {stats?.chain_integrity && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Intégrité de la chaîne</span>
              {stats.chain_integrity.is_valid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              )}
            </div>
            {!stats.chain_integrity.is_valid && (
              <p className="text-xs text-muted-foreground">
                {stats.chain_integrity.error_details}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => verifyIntegrity()}
            disabled={isVerifying}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
            Vérifier l'intégrité
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCompliance('json')}
            disabled={isExporting}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Indicateurs de conformité */}
        <div className="space-y-2 text-xs">
          <p className="font-medium text-muted-foreground">Exigences NF203 :</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Chaînage cryptographique activé</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Horodatage des documents</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Piste d'audit complète</span>
            </div>
            <div className="flex items-center gap-2">
              {stats?.compliance_rate === 100 ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-orange-600" />
              )}
              <span>Archivage sécurisé</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
