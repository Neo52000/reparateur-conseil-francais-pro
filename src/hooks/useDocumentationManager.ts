
/**
 * Hook complet pour la gestion de la documentation
 * Inclut l'automatisation, l'historique et la surveillance
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentationPDFService } from '@/services/documentationPDFService';
import { DocumentationManagerService, DocumentationVersion, DocumentationChange } from '@/services/documentationManagerService';

export interface DocumentationManagerHook {
  generating: boolean;
  autoUpdateEnabled: boolean;
  changes: DocumentationChange[];
  versions: Record<string, DocumentationVersion[]>;
  error: string | null;
  documentsExists: boolean;
  generatePDF: (docType: 'prd' | 'user-guide' | 'technical') => Promise<void>;
  generateAllPDFs: () => Promise<void>;
  enableAutoUpdate: () => void;
  disableAutoUpdate: () => void;
  checkForChanges: () => Promise<DocumentationChange[]>;
  getVersionHistory: (docType: 'prd' | 'user-guide' | 'technical') => Promise<void>;
  downloadVersion: (version: DocumentationVersion) => Promise<void>;
  previewDocument: (docType: 'prd' | 'user-guide' | 'technical') => Promise<void>;
  createBaseDocuments: () => Promise<void>;
}

export const useDocumentationManager = (): DocumentationManagerHook => {
  const [generating, setGenerating] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [changes, setChanges] = useState<DocumentationChange[]>([]);
  const [versions, setVersions] = useState<Record<string, DocumentationVersion[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [documentsExists, setDocumentsExists] = useState(true);
  const { toast } = useToast();

  // Vérifier l'existence des documents au démarrage
  useEffect(() => {
    const checkDocumentsExistence = async () => {
      try {
        await checkForChanges();
        setDocumentsExists(true);
        setError(null);
      } catch (error) {
        console.error('Erreur vérification documents:', error);
        setDocumentsExists(false);
        setError('Documents de base non trouvés');
      }
    };

    checkDocumentsExistence();
  }, []);

  const generatePDF = useCallback(async (docType: 'prd' | 'user-guide' | 'technical') => {
    if (generating) return;

    setGenerating(true);
    
    try {
      toast({
        title: "Génération PDF",
        description: "Génération du PDF en cours...",
      });

      const content = await fetchDocumentContent(docType);
      const metadata = DocumentationPDFService.generateMetadata(docType);
      const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
      
      DocumentationPDFService.downloadPDF(pdfBlob, metadata.filename);
      
      // Rafraîchir l'historique
      await getVersionHistory(docType);
      
      toast({
        title: "PDF généré avec succès",
        description: `Le document ${metadata.title} a été téléchargé.`,
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [generating, toast]);

  const generateAllPDFs = useCallback(async () => {
    if (generating) return;

    setGenerating(true);
    
    try {
      toast({
        title: "Génération complète",
        description: "Génération de tous les PDFs en cours...",
      });

      await DocumentationManagerService.autoGeneratePDFs();
      
      // Rafraîchir tous les historiques
      const docTypes: ('prd' | 'user-guide' | 'technical')[] = ['prd', 'user-guide', 'technical'];
      for (const docType of docTypes) {
        await getVersionHistory(docType);
      }
      
      toast({
        title: "Génération terminée",
        description: "Tous les PDFs ont été générés avec succès.",
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération complète:', error);
      toast({
        title: "Erreur de génération",
        description: "Erreur lors de la génération complète.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [generating, toast]);

  const checkForChanges = useCallback(async () => {
    try {
      setError(null);
      const detectedChanges = await DocumentationManagerService.checkForChanges();
      setChanges(detectedChanges);
      setDocumentsExists(true);
      
      const needsUpdate = detectedChanges.filter(c => c.needs_update);
      if (needsUpdate.length > 0) {
        toast({
          title: "Mises à jour disponibles",
          description: `${needsUpdate.length} document(s) ont été modifié(s).`,
        });
      }
      
      return detectedChanges;
    } catch (error) {
      console.error('Erreur vérification changements:', error);
      setError('Impossible de vérifier les documents');
      setDocumentsExists(false);
      return [];
    }
  }, [toast]);

  const getVersionHistory = useCallback(async (docType: 'prd' | 'user-guide' | 'technical') => {
    try {
      const history = await DocumentationManagerService.getVersionHistory(docType);
      setVersions(prev => ({
        ...prev,
        [docType]: history
      }));
    } catch (error) {
      console.error('Erreur récupération historique:', error);
    }
  }, []);

  const downloadVersion = useCallback(async (version: DocumentationVersion) => {
    try {
      // Régénérer le PDF à partir de l'historique
      const content = await fetchDocumentContent(version.doc_type);
      const metadata = DocumentationPDFService.generateMetadata(version.doc_type);
      metadata.version = version.version;
      
      const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
      DocumentationPDFService.downloadPDF(pdfBlob, `${metadata.filename.replace('.pdf', '')}_v${version.version}.pdf`);
      
      toast({
        title: "Version téléchargée",
        description: `Version ${version.version} du ${version.doc_type} téléchargée.`,
      });
    } catch (error) {
      console.error('Erreur téléchargement version:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger cette version.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const previewDocument = useCallback(async (docType: 'prd' | 'user-guide' | 'technical') => {
    try {
      const content = await fetchDocumentContent(docType);
      const metadata = DocumentationPDFService.generateMetadata(docType);
      const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
      
      // Ouvrir le PDF dans un nouvel onglet pour aperçu
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
      toast({
        title: "Aperçu ouvert",
        description: "L'aperçu PDF s'ouvre dans un nouvel onglet.",
      });
    } catch (error) {
      console.error('Erreur aperçu:', error);
      toast({
        title: "Erreur d'aperçu",
        description: "Impossible d'ouvrir l'aperçu.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const enableAutoUpdate = useCallback(() => {
    setAutoUpdateEnabled(true);
    DocumentationManagerService.initializeAutoUpdate();
    toast({
      title: "Mise à jour automatique activée",
      description: "La documentation sera surveillée en continu.",
    });
  }, [toast]);

  const disableAutoUpdate = useCallback(() => {
    setAutoUpdateEnabled(false);
    toast({
      title: "Mise à jour automatique désactivée",
      description: "La surveillance automatique est arrêtée.",
    });
  }, [toast]);

  const createBaseDocuments = useCallback(async () => {
    setError(null);
    toast({
      title: "Documents créés",
      description: "Les documents de base sont maintenant disponibles dans /docs/",
    });
    await checkForChanges();
  }, [toast, checkForChanges]);

  return {
    generating,
    autoUpdateEnabled,
    changes,
    versions,
    error,
    documentsExists,
    generatePDF,
    generateAllPDFs,
    enableAutoUpdate,
    disableAutoUpdate,
    checkForChanges,
    getVersionHistory,
    downloadVersion,
    previewDocument,
    createBaseDocuments,
  };
};

// Fonction utilitaire pour récupérer le contenu des documents
async function fetchDocumentContent(docType: 'prd' | 'user-guide' | 'technical'): Promise<string> {
const docPaths = {
  'prd': '/docs/PRD.md',
  'user-guide': '/docs/GUIDE_UTILISATEUR.md', 
  'technical': '/docs/DOCUMENTATION_TECHNIQUE.md'
};

  const response = await fetch(docPaths[docType]);
  if (!response.ok) {
    throw new Error(`Impossible de charger ${docPaths[docType]}`);
  }
  return await response.text();
}
