import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FECExportService } from '@/services/fecExportService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FECExportPanelProps {
  repairerId: string;
  siren: string;
}

export function FECExportPanel({ repairerId, siren }: FECExportPanelProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  const handleGenerateFEC = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Dates manquantes',
        description: 'Veuillez sélectionner une période',
        variant: 'destructive',
      });
      return;
    }

    if (!siren || siren.length !== 9) {
      toast({
        title: 'SIREN invalide',
        description: 'Le SIREN doit contenir 9 chiffres',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setValidationResult(null);

    try {
      // Générer le FEC côté client
      const fecContent = await FECExportService.generateFECClient({
        repairer_id: repairerId,
        start_date: startDate,
        end_date: endDate,
        siren: siren,
        format: 'txt',
        separator: '|'
      });

      // Valider le contenu
      const validation = FECExportService.validateFEC(fecContent);
      setValidationResult(validation);

      if (validation.valid) {
        // Télécharger le fichier
        FECExportService.downloadFEC(fecContent, siren, endDate);

        toast({
          title: '✅ FEC généré',
          description: 'Le fichier FEC a été téléchargé avec succès',
        });
      } else {
        toast({
          title: '⚠️ FEC généré avec avertissements',
          description: 'Le fichier contient des erreurs de validation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur génération FEC:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de générer le FEC',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Générer les dates suggérées
  const getSuggestedPeriods = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return [
      {
        label: 'Mois en cours',
        start: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
        end: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
      },
      {
        label: 'Mois dernier',
        start: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
        end: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
      },
      {
        label: 'Année en cours',
        start: `${currentYear}-01-01`,
        end: `${currentYear}-12-31`
      },
      {
        label: 'Année précédente',
        start: `${currentYear - 1}-01-01`,
        end: `${currentYear - 1}-12-31`
      }
    ];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export FEC
            </CardTitle>
            <CardDescription>
              Fichier des Écritures Comptables conforme DGFiP
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Norme NF203
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Format FEC</AlertTitle>
          <AlertDescription className="text-xs">
            Export au format TXT avec séparateur pipe (|), encodage UTF-8, conforme à la norme DGFiP.
            Nom du fichier : {siren}_FEC_YYYYMMDD.txt
          </AlertDescription>
        </Alert>

        {/* Sélection de période */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fec-start-date">Date de début</Label>
              <Input
                id="fec-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fec-end-date">Date de fin</Label>
              <Input
                id="fec-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Périodes suggérées */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Périodes suggérées</Label>
            <div className="flex flex-wrap gap-2">
              {getSuggestedPeriods().map((period) => (
                <Button
                  key={period.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(period.start);
                    setEndDate(period.end);
                  }}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Résultat de validation */}
        {validationResult && (
          <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
            {validationResult.valid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {validationResult.valid ? 'Validation réussie' : 'Erreurs détectées'}
            </AlertTitle>
            {validationResult.errors.length > 0 && (
              <AlertDescription>
                <ul className="text-xs mt-2 space-y-1">
                  {validationResult.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            )}
          </Alert>
        )}

        {/* SIREN */}
        <div className="space-y-2">
          <Label htmlFor="fec-siren">SIREN</Label>
          <Input
            id="fec-siren"
            type="text"
            value={siren}
            disabled
            placeholder="123456789"
            maxLength={9}
          />
          <p className="text-xs text-muted-foreground">
            Le SIREN sera utilisé dans le nom du fichier
          </p>
        </div>

        {/* Bouton de génération */}
        <Button
          onClick={handleGenerateFEC}
          disabled={isGenerating || !startDate || !endDate}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Générer et télécharger le FEC
            </>
          )}
        </Button>

        {/* Informations techniques */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="font-medium">Format FEC conforme :</p>
          <ul className="space-y-1 pl-4">
            <li>• 18 colonnes obligatoires</li>
            <li>• Séparateur : pipe (|)</li>
            <li>• Encodage : UTF-8</li>
            <li>• Dates au format YYYYMMDD</li>
            <li>• Montants au format français (virgule)</li>
            <li>• Plan comptable français</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
