import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNF203Periods } from '@/hooks/useNF203Archives';
import { Calendar, Lock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NF203PeriodClosureProps {
  repairerId: string;
}

export function NF203PeriodClosure({ repairerId }: NF203PeriodClosureProps) {
  const {
    closures,
    closureStats,
    isLoading,
    checkCanClose,
    isCheckingCanClose,
    canCloseResult,
    closePeriod,
    isClosing
  } = useNF203Periods(repairerId);

  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCheckCanClose = () => {
    if (startDate && endDate) {
      checkCanClose({ startDate, endDate });
    }
  };

  const handleClosePeriod = () => {
    if (startDate && endDate && canCloseResult?.can_close) {
      closePeriod({ periodType, startDate, endDate });
      setShowClosureDialog(false);
      setStartDate('');
      setEndDate('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Calendar className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = closureStats;

  return (
    <div className="space-y-4">
      {/* Statistiques de clôture */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clôtures totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_closures || 0}</div>
            <p className="text-xs text-muted-foreground">périodes fermées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures clôturées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.total_invoices_closed || 0}
            </div>
            <p className="text-xs text-muted-foreground">documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.total_amount_closed || 0).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
            <p className="text-xs text-muted-foreground">TTC</p>
          </CardContent>
        </Card>
      </div>

      {/* Bouton clôture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Nouvelle clôture</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowClosureDialog(true)}
            className="w-full"
          >
            <Lock className="h-4 w-4 mr-2" />
            Clôturer une période
          </Button>
        </CardContent>
      </Card>

      {/* Historique des clôtures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des clôtures
          </CardTitle>
          <CardDescription>
            Périodes comptables fermées et sécurisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {closures && closures.length > 0 ? (
                closures.map((closure) => (
                  <div
                    key={closure.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            {closure.period_type === 'monthly' && 'Mensuelle'}
                            {closure.period_type === 'quarterly' && 'Trimestrielle'}
                            {closure.period_type === 'annual' && 'Annuelle'}
                          </Badge>
                          {closure.is_locked && (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" />
                              Verrouillée
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">
                            {format(new Date(closure.period_start), 'dd MMMM yyyy', { locale: fr })}
                            {' → '}
                            {format(new Date(closure.period_end), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span>{closure.invoice_count} factures</span>
                            <span>
                              {parseFloat(closure.total_ttc.toString()).toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            Hash: {closure.closure_hash.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Aucune clôture effectuée
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog de clôture */}
      <Dialog open={showClosureDialog} onOpenChange={setShowClosureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clôturer une période comptable</DialogTitle>
            <DialogDescription>
              Verrouillage définitif des données pour conformité NF203
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="period-type">Type de période</Label>
              <Select value={periodType} onValueChange={(v: any) => setPeriodType(v)}>
                <SelectTrigger id="period-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuelle</SelectItem>
                  <SelectItem value="quarterly">Trimestrielle</SelectItem>
                  <SelectItem value="annual">Annuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {startDate && endDate && (
              <Button
                variant="outline"
                onClick={handleCheckCanClose}
                disabled={isCheckingCanClose}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Vérifier la période
              </Button>
            )}

            {canCloseResult && (
              <div className={`p-4 rounded-lg border ${
                canCloseResult.can_close
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start gap-2">
                  {canCloseResult.can_close ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {canCloseResult.can_close
                        ? 'Période prête à être clôturée'
                        : 'Impossible de clôturer cette période'}
                    </p>
                    <ul className="text-xs mt-2 space-y-1">
                      <li>• {canCloseResult.invoice_count} facture(s) trouvée(s)</li>
                      <li>• Chaînage: {canCloseResult.all_chained ? 'OK' : 'Incomplet'}</li>
                      <li>• Anomalies: {canCloseResult.has_anomalies ? 'Détectées' : 'Aucune'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClosureDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleClosePeriod}
              disabled={!canCloseResult?.can_close || isClosing}
            >
              <Lock className="h-4 w-4 mr-2" />
              Clôturer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
