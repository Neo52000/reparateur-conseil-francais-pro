
import Papa from 'papaparse';
import { EncodingUtils } from '../encoding/EncodingUtils';
import { CSVValidator } from '../validation/CSVValidator';

export interface ImportResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
  data: any[];
}

export class CSVParser {
  /**
   * Parse CSV file and return processed data
   */
  static async parseFile(file: File): Promise<ImportResult> {
    console.log('📄 CSVParser: Début du parsing du fichier:', file.name);
    
    return new Promise((resolve) => {
      const errors: string[] = [];
      let processed = 0;
      let skipped = 0;
      const validData: any[] = [];

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          console.log('📊 Papa Parse résultats:', {
            data: results.data?.length || 0,
            errors: results.errors?.length || 0,
            meta: results.meta
          });

          if (results.errors && results.errors.length > 0) {
            console.log('⚠️ Erreurs Papa Parse:', results.errors);
            results.errors.forEach(error => {
              errors.push(`Erreur parsing: ${error.message} (ligne ${error.row})`);
            });
          }

          const rows = results.data as any[];
          console.log(`🔍 Processing ${rows.length} lignes`);
          
          rows.forEach((row, index) => {
            console.log(`Ligne ${index + 1}:`, row);
            
            try {
              // Apply encoding fixes to text fields
              const fixedRow = this.applyEncodingFixes(row);
              
              // Validate required fields
              const validation = CSVValidator.validateRepairerRow(fixedRow, index);
              if (!validation.isValid) {
                console.log(`⚠️ Ligne ${index + 1}: Validation échouée`);
                skipped++;
                errors.push(...validation.errors);
                return;
              }
              
              // Process and clean the row
              const processedRow = CSVValidator.processRow(fixedRow);
              
              console.log(`✅ Ligne ${index + 1} validée et corrigée:`, processedRow);
              validData.push(processedRow);
              processed++;
              
            } catch (error) {
              console.error(`❌ Erreur ligne ${index + 1}:`, error);
              errors.push(`Ligne ${index + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
              skipped++;
            }
          });

          const result = {
            success: errors.length === 0 || processed > 0,
            processed,
            skipped,
            errors,
            data: validData
          };

          console.log('📊 Résultat final CSVParser:', result);
          resolve(result);
        },
        error: (error) => {
          console.error('💥 Erreur Papa Parse:', error);
          resolve({
            success: false,
            processed: 0,
            skipped: 0,
            errors: [`Erreur de lecture du fichier: ${error.message}`],
            data: []
          });
        }
      });
    });
  }

  /**
   * Apply encoding fixes to all text fields in a row
   */
  private static applyEncodingFixes(row: any): any {
    return {
      ...row,
      name: row.name ? EncodingUtils.fixEncoding(row.name.toString()) : '',
      address: row.address ? EncodingUtils.fixEncoding(row.address.toString()) : '',
      city: row.city ? EncodingUtils.fixEncoding(row.city.toString()) : '',
      services: row.services ? EncodingUtils.fixEncoding(row.services.toString()) : '',
      specialties: row.specialties ? EncodingUtils.fixEncoding(row.specialties.toString()) : '',
      email: row.email ? EncodingUtils.fixEncoding(row.email.toString()) : '',
      website: row.website ? EncodingUtils.fixEncoding(row.website.toString()) : ''
    };
  }
}
