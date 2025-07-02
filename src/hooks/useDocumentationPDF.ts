/**
 * Hook pour gérer la génération et mise à jour automatique des PDFs
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentationPDFService, DocumentMetadata } from '@/services/documentationPDFService';

export interface DocumentationPDFHook {
  generating: boolean;
  generatePDF: (docType: 'prd' | 'user-guide' | 'technical') => Promise<void>;
  generateAllPDFs: () => Promise<void>;
}

export const useDocumentationPDF = (): DocumentationPDFHook => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const fetchDocumentContent = async (docType: 'prd' | 'user-guide' | 'technical'): Promise<string> => {
    const docPaths = {
      'prd': '/docs/PRD.md',
      'user-guide': '/docs/user-guide.md',
      'technical': '/docs/README.md'
    };

    try {
      const response = await fetch(docPaths[docType]);
      if (!response.ok) {
        throw new Error(`Impossible de charger ${docPaths[docType]}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Erreur lors du chargement du document ${docType}:`, error);
      throw new Error(`Document ${docType} non disponible`);
    }
  };

  const generatePDF = useCallback(async (docType: 'prd' | 'user-guide' | 'technical') => {
    if (generating) return;

    setGenerating(true);
    
    try {
      toast({
        title: "Génération PDF",
        description: "Génération du PDF en cours...",
      });

      // Récupérer le contenu du document
      const content = await fetchDocumentContent(docType);
      
      // Générer les métadonnées
      const metadata = DocumentationPDFService.generateMetadata(docType);
      
      // Générer le PDF
      const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
      
      // Télécharger le PDF
      DocumentationPDFService.downloadPDF(pdfBlob, metadata.filename);
      
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
        title: "Génération de tous les PDFs",
        description: "Génération de la documentation complète...",
      });

      const docTypes: ('prd' | 'user-guide' | 'technical')[] = ['prd', 'user-guide', 'technical'];
      
      for (const docType of docTypes) {
        try {
          const content = await fetchDocumentContent(docType);
          const metadata = DocumentationPDFService.generateMetadata(docType);
          const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
          DocumentationPDFService.downloadPDF(pdfBlob, metadata.filename);
          
          // Petite pause entre chaque génération
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erreur pour ${docType}:`, error);
        }
      }
      
      toast({
        title: "Documentation générée",
        description: "Tous les PDFs disponibles ont été téléchargés.",
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération complète:', error);
      toast({
        title: "Erreur de génération",
        description: "Erreur lors de la génération de la documentation complète.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [generating, toast]);

  return {
    generating,
    generatePDF,
    generateAllPDFs,
  };
};