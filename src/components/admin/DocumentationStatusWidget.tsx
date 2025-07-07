
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useDocumentationManager } from '@/hooks/useDocumentationManager';

const DocumentationStatusWidget: React.FC = () => {
  const {
    autoUpdateEnabled,
    changes,
    checkForChanges,
    generateAllPDFs,
    generating,
    enableAutoUpdate,
    disableAutoUpdate,
    error,
    documentsExists,
    createBaseDocuments
  } = useDocumentationManager();
  
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [nextCheck, setNextCheck] = useState<Date>(new Date(Date.now() + 5 * 60 * 1000));

  // Mettre à jour les heures de vérification
  useEffect(() => {
    if (autoUpdateEnabled) {
      const interval = setInterval(() => {
        setLastCheck(new Date());
        setNextCheck(new Date(Date.now() + 5 * 60 * 1000));
        checkForChanges();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoUpdateEnabled, checkForChanges]);

  const needsUpdate = changes.filter(c => c.needs_update);
  const upToDate = changes.filter(c => !c.needs_update);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Surveillance Documentation
        </CardTitle>
        <CardDescription>
          Statut de la surveillance automatique (toutes les 5 minutes)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut de la surveillance */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${autoUpdateEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div>
              <p className="font-medium">
                {autoUpdateEnabled ? 'Surveillance active' : 'Surveillance inactive'}
              </p>
              <p className="text-sm text-muted-foreground">
                {autoUpdateEnabled ? 'Vérification automatique toutes les 5 minutes' : 'Surveillance désactivée'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={autoUpdateEnabled ? disableAutoUpdate : enableAutoUpdate}
              variant={autoUpdateEnabled ? "destructive" : "default"}
              size="sm"
            >
              {autoUpdateEnabled ? 'Désactiver' : 'Activer'}
            </Button>
            <Button
              onClick={checkForChanges}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Horaires */}
        {autoUpdateEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <Clock className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-600">Dernière vérification</p>
              <p className="text-sm font-medium">{lastCheck.toLocaleTimeString('fr-FR')}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <Clock className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-600">Prochaine vérification</p>
              <p className="text-sm font-medium">{nextCheck.toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        )}

        {/* Statut des documents */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">État des documents</h4>
          {changes.map((change) => (
            <div key={change.doc_type} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm capitalize">{change.doc_type.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                {change.needs_update ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <Badge variant="secondary">Mise à jour nécessaire</Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default">À jour</Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {needsUpdate.length > 0 && (
          <div className="pt-2 border-t">
            <Button
              onClick={generateAllPDFs}
              disabled={generating}
              className="w-full"
              size="sm"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Mettre à jour ({needsUpdate.length} document{needsUpdate.length > 1 ? 's' : ''})
                </>
              )}
            </Button>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{upToDate.length}</p>
            <p className="text-xs text-muted-foreground">À jour</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-600">{needsUpdate.length}</p>
            <p className="text-xs text-muted-foreground">À mettre à jour</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentationStatusWidget;
