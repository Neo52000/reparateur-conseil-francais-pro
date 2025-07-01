/**
 * Service principal de preprocessing pour normaliser le contenu importé
 */

import { FormatDetector, DetectedFormat } from './formatDetector';
import { ContentCleaner, PreprocessOptions } from './contentCleaner';
import { ContentValidator, ValidationResult, ContentComparison } from './contentValidator';

export type { PreprocessOptions, DetectedFormat, ValidationResult, ContentComparison };

export class ContentPreprocessor {
  /**
   * Détecte le format source du contenu
   */
  static detectFormat = FormatDetector.detectFormat;

  /**
   * Nettoie et normalise le contenu de manière conservatrice
   */
  static preprocess(content: string, options: PreprocessOptions = {}): string {
    const {
      preserveFormatting = true,
      cleanMetadata = true,
      convertCallouts = false,
      normalizeLineBreaks = true,
      conservative = true
    } = options;

    let processed = content;

    // Mode conservateur : transformations minimales
    if (conservative) {
      if (cleanMetadata) {
        processed = ContentCleaner.cleanMetadataConservative(processed);
      }
      
      if (normalizeLineBreaks) {
        processed = ContentCleaner.normalizeLineBreaksConservative(processed);
      }
      
      return processed;
    }

    // Mode normal (plus agressif)
    if (cleanMetadata) {
      processed = ContentCleaner.cleanMetadata(processed);
    }

    if (normalizeLineBreaks) {
      processed = ContentCleaner.normalizeLineBreaks(processed);
    }

    if (convertCallouts) {
      processed = ContentCleaner.convertCallouts(processed);
    }

    if (preserveFormatting) {
      processed = ContentCleaner.preserveFormatting(processed);
    }

    return processed;
  }

  /**
   * Conversion spécifique pour les exports Claude.ai
   */
  static processClaudeExport = ContentCleaner.processClaudeExport;

  /**
   * Validation du contenu traité
   */
  static validateProcessedContent = ContentValidator.validateProcessedContent;

  /**
   * Compare deux contenus
   */
  static compareContents = ContentValidator.compareContents;
}
