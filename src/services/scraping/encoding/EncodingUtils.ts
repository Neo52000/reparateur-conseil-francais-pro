
/**
 * Utilities for fixing encoding issues in scraped data
 */

interface EncodingFixes {
  [key: string]: string;
}

export class EncodingUtils {
  // Dictionary of common encoding fixes
  private static readonly encodingFixes: EncodingFixes = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã ': 'à',
    'Ã§': 'ç',
    'Ã´': 'ô',
    'Ã¹': 'ù',
    'Ã«': 'ë',
    'Ã¯': 'ï',
    'Ã®': 'î',
    'Ã¢': 'â',
    'Ã¡': 'á',
    'Ã³': 'ó',
    'Ã±': 'ñ',
    'Ã€': 'À',
    'Ã‰': 'É',
    'Ã‡': 'Ç',
    'rÃ©parateur': 'réparateur',
    'rÃ©paration': 'réparation',
    'tÃ©lÃ©phone': 'téléphone',
    'Ã©lectronique': 'électronique',
    'prÃ©cision': 'précision',
    'qualitÃ©': 'qualité',
    'spÃ©cialitÃ©': 'spécialité',
    'expÃ©rience': 'expérience'
  };

  /**
   * Fix encoding issues in text
   */
  static fixEncoding(text: string): string {
    if (!text || typeof text !== 'string') return text;
    
    let fixedText = text;
    
    // Replace all malformed characters
    Object.keys(this.encodingFixes).forEach(badChar => {
      const regex = new RegExp(badChar, 'g');
      fixedText = fixedText.replace(regex, this.encodingFixes[badChar]);
    });

    return fixedText;
  }
}
