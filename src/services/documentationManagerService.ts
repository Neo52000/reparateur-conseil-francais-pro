
/**
 * Service de gestion complète de la documentation
 * Gère l'automatisation, la détection de changements et l'historique
 */

import { supabase } from '@/integrations/supabase/client';
import { DocumentationPDFService, DocumentMetadata } from './documentationPDFService';

export interface DocumentationVersion {
  id: string;
  doc_type: 'prd' | 'user-guide' | 'technical';
  version: string;
  content_hash: string;
  generated_at: string;
  file_size: number;
  download_count: number;
}

export interface DocumentationChange {
  doc_type: 'prd' | 'user-guide' | 'technical';
  last_modified: string;
  content_hash: string;
  needs_update: boolean;
}

export class DocumentationManagerService {
  private static readonly CACHE_KEY = 'documentation_cache';
  private static readonly CHANGE_DETECTION_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialise la surveillance automatique des documents
   */
  static initializeAutoUpdate(): void {
    // Vérification périodique des changements
    setInterval(async () => {
      await this.checkForChanges();
    }, this.CHANGE_DETECTION_INTERVAL);

    // Vérification immédiate au démarrage
    this.checkForChanges();
  }

  /**
   * Vérifie les changements dans la documentation
   */
  static async checkForChanges(): Promise<DocumentationChange[]> {
    const docTypes: ('prd' | 'user-guide' | 'technical')[] = ['prd', 'user-guide', 'technical'];
    const changes: DocumentationChange[] = [];

    for (const docType of docTypes) {
      try {
        const content = await this.fetchDocumentContent(docType);
        const currentHash = await this.generateContentHash(content);
        const lastKnownHash = await this.getLastKnownHash(docType);
        
        const change: DocumentationChange = {
          doc_type: docType,
          last_modified: new Date().toISOString(),
          content_hash: currentHash,
          needs_update: currentHash !== lastKnownHash
        };

        changes.push(change);

        // Mettre à jour le cache si nécessaire
        if (change.needs_update) {
          await this.updateContentCache(docType, currentHash);
          console.log(`Changement détecté dans ${docType}: ${currentHash}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la vérification de ${docType}:`, error);
      }
    }

    return changes;
  }

  /**
   * Génère automatiquement les PDFs pour les documents modifiés
   */
  static async autoGeneratePDFs(): Promise<void> {
    const changes = await this.checkForChanges();
    const needsUpdate = changes.filter(change => change.needs_update);

    if (needsUpdate.length === 0) {
      console.log('Aucune mise à jour nécessaire');
      return;
    }

    console.log(`Génération automatique de ${needsUpdate.length} document(s)`);

    for (const change of needsUpdate) {
      try {
        const content = await this.fetchDocumentContent(change.doc_type);
        const metadata = DocumentationPDFService.generateMetadata(change.doc_type);
        const pdfBlob = await DocumentationPDFService.generatePDF(content, metadata);
        
        // Sauvegarder la version
        await this.saveVersion(change.doc_type, metadata, pdfBlob, change.content_hash);
        
        console.log(`PDF généré pour ${change.doc_type}`);
      } catch (error) {
        console.error(`Erreur génération PDF ${change.doc_type}:`, error);
      }
    }
  }

  /**
   * Récupère l'historique des versions d'un document
   */
  static async getVersionHistory(docType: 'prd' | 'user-guide' | 'technical'): Promise<DocumentationVersion[]> {
    try {
      const { data, error } = await supabase
        .from('documentation_versions')
        .select('*')
        .eq('doc_type', docType)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase récupération historique:', error);
        return [];
      }
      return (data || []) as DocumentationVersion[];
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }

  /**
   * Sauvegarde une nouvelle version dans l'historique
   */
  private static async saveVersion(
    docType: 'prd' | 'user-guide' | 'technical',
    metadata: DocumentMetadata,
    pdfBlob: Blob,
    contentHash: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('documentation_versions')
        .insert({
          doc_type: docType,
          version: metadata.version,
          content_hash: contentHash,
          generated_at: new Date().toISOString(),
          file_size: pdfBlob.size,
          download_count: 0
        });

      if (error) {
        console.error('Erreur Supabase sauvegarde version:', error);
      }
    } catch (error) {
      console.error('Erreur sauvegarde version:', error);
    }
  }

  /**
   * Récupère le contenu d'un document avec gestion d'erreurs améliorée
   */
  private static async fetchDocumentContent(docType: 'prd' | 'user-guide' | 'technical'): Promise<string> {
    const docPaths = {
      'prd': '/docs/PRD.md',
      'user-guide': '/docs/GUIDE_UTILISATEUR.md', 
      'technical': '/docs/DOCUMENTATION_TECHNIQUE.md'
    };

    try {
      const response = await fetch(docPaths[docType]);
      if (!response.ok) {
        throw new Error(`Document ${docType} non accessible (${response.status})`);
      }
      const content = await response.text();
      if (!content.trim()) {
        throw new Error(`Document ${docType} vide`);
      }
      return content;
    } catch (error) {
      console.error(`Erreur chargement ${docType}:`, error);
      throw new Error(`Document ${docType} indisponible`);
    }
  }

  /**
   * Génère un hash pour détecter les changements
   */
  private static async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Récupère le dernier hash connu d'un document
   */
  private static async getLastKnownHash(docType: string): Promise<string | null> {
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}_${docType}`);
      return cached ? JSON.parse(cached).hash : null;
    } catch {
      return null;
    }
  }

  /**
   * Met à jour le cache des hashes
   */
  private static async updateContentCache(docType: string, hash: string): Promise<void> {
    try {
      localStorage.setItem(`${this.CACHE_KEY}_${docType}`, JSON.stringify({
        hash,
        updated_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erreur mise à jour cache:', error);
    }
  }

  /**
   * Nettoie les anciennes versions (garde les 10 dernières)
   */
  static async cleanupOldVersions(): Promise<void> {
    const docTypes: ('prd' | 'user-guide' | 'technical')[] = ['prd', 'user-guide', 'technical'];
    
    for (const docType of docTypes) {
      try {
        const { data: versions } = await supabase
          .from('documentation_versions')
          .select('id')
          .eq('doc_type', docType)
          .order('generated_at', { ascending: false })
          .range(10, 999);

        if (versions && versions.length > 0) {
          const idsToDelete = versions.map((v: any) => v.id);
          await supabase
            .from('documentation_versions')
            .delete()
            .in('id', idsToDelete);
        }
      } catch (error) {
        console.error(`Erreur nettoyage ${docType}:`, error);
      }
    }
  }
}
