import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NF203ArchiveService, NF203PeriodService } from '@/services/nf203ArchiveService';
import { useToast } from '@/hooks/use-toast';

export function useNF203Archives(repairerId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les archives
  const { data: archives, isLoading: archivesLoading } = useQuery({
    queryKey: ['nf203-archives', repairerId],
    queryFn: () => NF203ArchiveService.getArchives(repairerId!),
    enabled: !!repairerId
  });

  // Récupérer les statistiques
  const { data: archiveStats, isLoading: statsLoading } = useQuery({
    queryKey: ['nf203-archive-stats', repairerId],
    queryFn: () => NF203ArchiveService.getArchiveStats(repairerId!),
    enabled: !!repairerId
  });

  // Mettre en conservation légale
  const setLegalHold = useMutation({
    mutationFn: ({ archiveId, enabled }: { archiveId: string; enabled: boolean }) =>
      NF203ArchiveService.setLegalHold(archiveId, enabled),
    onSuccess: (success, { enabled }) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['nf203-archives', repairerId] });
        queryClient.invalidateQueries({ queryKey: ['nf203-archive-stats', repairerId] });
        toast({
          title: enabled ? '🔒 Conservation légale activée' : '🔓 Conservation légale désactivée',
          description: 'Archive mise à jour avec succès',
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de modifier la conservation légale',
          variant: 'destructive',
        });
      }
    }
  });

  // Marquer les archives expirées
  const markExpired = useMutation({
    mutationFn: () => NF203ArchiveService.markExpired(repairerId!),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['nf203-archives', repairerId] });
      queryClient.invalidateQueries({ queryKey: ['nf203-archive-stats', repairerId] });
      toast({
        title: '✅ Archives expirées',
        description: `${count} archive(s) marquée(s) comme expirée(s)`,
      });
    }
  });

  return {
    archives,
    archiveStats,
    isLoading: archivesLoading || statsLoading,
    setLegalHold: setLegalHold.mutate,
    isSettingLegalHold: setLegalHold.isPending,
    markExpired: markExpired.mutate,
    isMarkingExpired: markExpired.isPending
  };
}

export function useNF203Periods(repairerId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les clôtures
  const { data: closures, isLoading: closuresLoading } = useQuery({
    queryKey: ['nf203-period-closures', repairerId],
    queryFn: () => NF203PeriodService.getClosures(repairerId!),
    enabled: !!repairerId
  });

  // Récupérer les statistiques
  const { data: closureStats, isLoading: statsLoading } = useQuery({
    queryKey: ['nf203-closure-stats', repairerId],
    queryFn: () => NF203PeriodService.getClosureStats(repairerId!),
    enabled: !!repairerId
  });

  // Vérifier si une période peut être clôturée
  const checkCanClose = useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) =>
      NF203PeriodService.canClosePeriod(repairerId!, startDate, endDate),
  });

  // Clôturer une période
  const closePeriod = useMutation({
    mutationFn: ({
      periodType,
      startDate,
      endDate
    }: {
      periodType: 'monthly' | 'quarterly' | 'annual';
      startDate: string;
      endDate: string;
    }) => NF203PeriodService.closePeriod(repairerId!, periodType, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf203-period-closures', repairerId] });
      queryClient.invalidateQueries({ queryKey: ['nf203-closure-stats', repairerId] });
      toast({
        title: '✅ Période clôturée',
        description: 'La période comptable a été clôturée avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur de clôture',
        description: error instanceof Error ? error.message : 'Impossible de clôturer la période',
        variant: 'destructive',
      });
    }
  });

  return {
    closures,
    closureStats,
    isLoading: closuresLoading || statsLoading,
    checkCanClose: checkCanClose.mutate,
    isCheckingCanClose: checkCanClose.isPending,
    canCloseResult: checkCanClose.data,
    closePeriod: closePeriod.mutate,
    isClosing: closePeriod.isPending
  };
}
