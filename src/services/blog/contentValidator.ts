
/**
 * Service de validation et comparaison du contenu
 */

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface ContentComparison {
  linesChanged: number;
  charactersChanged: number;
  majorChanges: string[];
}

export class ContentValidator {
  /**
   * Validation du contenu traité
   */
  static validateProcessedContent(content: string): ValidationResult {
    const issues: string[] = [];
    
    // Vérifier les code blocks non fermés
    const codeBlocks = content.match(/```/g);
    if (codeBlocks && codeBlocks.length % 2 !== 0) {
      issues.push('Code block non fermé détecté');
    }

    const malformedLinks = content.match(/\[([^\]]*)\]\([^)]*$/gm);
    if (malformedLinks) {
      issues.push('Liens malformés détectés');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Compare deux contenus et retourne les différences principales
   */
  static compareContents(original: string, processed: string): ContentComparison {
    const originalLines = original.split('\n');
    const processedLines = processed.split('\n');
    
    let linesChanged = 0;
    const majorChanges: string[] = [];
    
    // Compter les lignes modifiées
    const maxLines = Math.max(originalLines.length, processedLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (originalLines[i] !== processedLines[i]) {
        linesChanged++;
      }
    }
    
    // Détecter les changements majeurs
    if (original.length !== processed.length) {
      const diff = Math.abs(original.length - processed.length);
      if (diff > original.length * 0.1) {
        majorChanges.push(`Taille du contenu modifiée de ${diff} caractères`);
      }
    }
    
    // Détecter les transformations de callouts
    const originalCallouts = (original.match(/[💡⚠️📝✅❌🔍]/g) || []).length;
    const processedCallouts = (processed.match(/[💡⚠️📝✅❌🔍]/g) || []).length;
    if (originalCallouts !== processedCallouts) {
      majorChanges.push('Callouts/émojis modifiés');
    }
    
    return {
      linesChanged,
      charactersChanged: Math.abs(original.length - processed.length),
      majorChanges
    };
  }
}
