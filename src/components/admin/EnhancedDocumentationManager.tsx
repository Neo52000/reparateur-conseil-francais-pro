
/**
 * Gestionnaire de documentation avancé avec toutes les fonctionnalités
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useDocumentationManager } from '@/hooks/useDocumentationManager';
import { 
  FileText, 
  BookOpen, 
  Users, 
  Database, 
  Download, 
  Eye, 
  History, 
  RefreshCw, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

const EnhancedDocumentationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generation');
  const {
    generating,
    autoUpdateEnabled,
    changes,
    versions,
    generatePDF,
    generateAllPDFs,
    enableAutoUpdate,
    disableAutoUpdate,
    checkForChanges,
    getVersionHistory,
    downloadVersion,
    previewDocument,
  } = useDocumentationManager();

  // Charger les historiques au montage
  useEffect(() => {
    const loadHistories = async () => {
      await Promise.all([
        getVersionHistory('prd'),
        getVersionHistory('user-guide'),
        getVersionHistory('technical')
      ]);
    };
    loadHistories();
  }, [getVersionHistory]);

  const getDocumentIcon = (docType: string) => {
    switch (docType) {
      case 'prd': return BookOpen;
      case 'user-guide': return Users;
      case 'technical': return Database;
      default: return FileText;
    }
  };

  const getDocumentTitle = (docType: string) => {
    switch (docType) {
      case 'prd': return 'Product Requirements Document';
      case 'user-guide': return 'Guide Utilisateur';
      case 'technical': return 'Documentation Technique';
      default: return docType;
    }
  };

  const getChangeStatus = (docType: string) => {
    const change = changes.find(c => c.doc_type === docType);
    return change?.needs_update ? 'outdated' : 'current';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestionnaire de Documentation</h2>
          <p className="text-muted-foreground">
            Génération automatique et gestion des versions PDF
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoUpdateEnabled}
              onCheckedChange={autoUpdateEnabled ? disableAutoUpdate : enableAutoUpdate}
            />
            <span className="text-sm">Mise à jour automatique</span>
          </div>
          <Button
            onClick={checkForChanges}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Vérifier les changements
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Génération
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Surveillance
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-6">
          {/* Génération de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Génération PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bouton génération complète */}
                <div className="col-span-full">
                  <Button
                    onClick={generateAllPDFs}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Générer tous les PDFs
                      </>
                    )}
                  </Button>
                </div>

                {/* Documents individuels */}
                {(['prd', 'user-guide', 'technical'] as const).map((docType) => {
                  const Icon = getDocumentIcon(docType);
                  const status = getChangeStatus(docType);
                  
                  return (
                    <Card key={docType} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-sm">{getDocumentTitle(docType)}</h3>
                        <Badge variant={status === 'outdated' ? 'destructive' : 'secondary'} className="text-xs">
                          {status === 'outdated' ? 'Obsolète' : 'À jour'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Button
                          onClick={() => generatePDF(docType)}
                          disabled={generating}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Générer PDF
                        </Button>
                        
                        <Button
                          onClick={() => previewDocument(docType)}
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Aperçu
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Historique des versions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['prd', 'user-guide', 'technical'] as const).map((docType) => {
              const Icon = getDocumentIcon(docType);
              const docVersions = versions[docType] || [];
              
              return (
                <Card key={docType}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5" />
                      {getDocumentTitle(docType)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {docVersions.length > 0 ? (
                        docVersions.slice(0, 5).map((version) => (
                          <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">Version {version.version}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(version.generated_at).toLocaleString('fr-FR')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(version.file_size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button
                              onClick={() => downloadVersion(version)}
                              variant="ghost"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucune version disponible
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Surveillance des changements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                État de la surveillance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className={`h-3 w-3 rounded-full ${autoUpdateEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium">Surveillance automatique</p>
                    <p className="text-sm text-muted-foreground">
                      {autoUpdateEnabled ? 'Activée' : 'Désactivée'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Dernière vérification</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Intervalle</p>
                    <p className="text-sm text-muted-foreground">5 minutes</p>
                  </div>
                </div>
              </div>

              {/* État des documents */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">État des documents</h4>
                <div className="space-y-2">
                  {changes.map((change) => {
                    const Icon = getDocumentIcon(change.doc_type);
                    const StatusIcon = change.needs_update ? AlertCircle : CheckCircle;
                    
                    return (
                      <div key={change.doc_type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <div>
                            <p className="font-medium text-sm">{getDocumentTitle(change.doc_type)}</p>
                            <p className="text-xs text-muted-foreground">
                              Dernière modification: {new Date(change.last_modified).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${change.needs_update ? 'text-yellow-500' : 'text-green-500'}`} />
                          <Badge variant={change.needs_update ? 'secondary' : 'default'}>
                            {change.needs_update ? 'Mise à jour nécessaire' : 'À jour'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {/* Aperçu des documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu des documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['prd', 'user-guide', 'technical'] as const).map((docType) => {
                  const Icon = getDocumentIcon(docType);
                  
                  return (
                    <Card key={docType} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{getDocumentTitle(docType)}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <Button
                          onClick={() => previewDocument(docType)}
                          className="w-full"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ouvrir l'aperçu
                        </Button>
                        
                        <div className="text-xs text-muted-foreground">
                          <p>• Aperçu temps réel</p>
                          <p>• Format PDF optimisé</p>
                          <p>• Mise en page professionnelle</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDocumentationManager;
