import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NF203ChainService } from '@/services/nf203ChainService';
import { useToast } from '@/hooks/use-toast';

export function useNF203Chain(repairerId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer la chaîne complète
  const { data: chain, isLoading: chainLoading } = useQuery({
    queryKey: ['nf203-chain', repairerId],
    queryFn: () => NF203ChainService.getChain(repairerId!),
    enabled: !!repairerId
  });

  // Récupérer les statistiques de conformité
  const { data: complianceStats, isLoading: statsLoading } = useQuery({
    queryKey: ['nf203-compliance-stats', repairerId],
    queryFn: () => NF203ChainService.getComplianceStats(repairerId!),
    enabled: !!repairerId
  });

  // Vérifier l'intégrité de la chaîne
  const verifyIntegrity = useMutation({
    mutationFn: () => NF203ChainService.verifyChainIntegrity(repairerId!),
    onSuccess: (data) => {
      if (data.is_valid) {
        toast({
          title: '✅ Chaîne NF203 valide',
          description: `${data.total_invoices} factures vérifiées avec succès`,
        });
      } else {
        toast({
          title: '⚠️ Problème d\'intégrité détecté',
          description: data.error_details,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur de vérification',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  });

  // Exporter les données de conformité
  const exportCompliance = useMutation({
    mutationFn: (format: 'json' | 'csv' = 'json') =>
      NF203ChainService.exportComplianceData(repairerId!, format),
    onSuccess: (data, format) => {
      // Créer un blob et télécharger
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nf203-compliance-${repairerId}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Export réussi',
        description: `Données de conformité exportées en ${format.toUpperCase()}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur d\'export',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  });

  return {
    chain,
    complianceStats,
    isLoading: chainLoading || statsLoading,
    verifyIntegrity: verifyIntegrity.mutate,
    isVerifying: verifyIntegrity.isPending,
    exportCompliance: exportCompliance.mutate,
    isExporting: exportCompliance.isPending
  };
}

export function useNF203AuditTrail(entityId: string | undefined, entityType: string = 'invoice') {
  const { data: auditTrail, isLoading } = useQuery({
    queryKey: ['nf203-audit-trail', entityId, entityType],
    queryFn: () => NF203ChainService.getAuditTrail(entityId!, entityType),
    enabled: !!entityId
  });

  return {
    auditTrail,
    isLoading
  };
}

export function useNF203Timestamp(documentId: string | undefined, documentType: string = 'invoice') {
  const { data: timestamp, isLoading } = useQuery({
    queryKey: ['nf203-timestamp', documentId, documentType],
    queryFn: () => NF203ChainService.getTimestamp(documentId!, documentType),
    enabled: !!documentId
  });

  return {
    timestamp,
    isLoading
  };
}
