
import Papa from 'papaparse';

interface RepairerData {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  services: string[];
  specialties: string[];
  price_range: string;
}

export interface ImportResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
  data: any[];
}

export class CSVService {
  static async importFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const errors: string[] = [];
      let processed = 0;
      let skipped = 0;
      const validData: any[] = [];

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const rows = results.data as any[];
          
          rows.forEach((row, index) => {
            try {
              if (!row.name || !row.city) {
                skipped++;
                return;
              }
              
              // Process and validate the row
              const processedRow = {
                ...row,
                services: row.services ? row.services.split(',').map((s: string) => s.trim()) : [],
                specialties: row.specialties ? row.specialties.split(',').map((s: string) => s.trim()) : []
              };
              
              validData.push(processedRow);
              processed++;
            } catch (error) {
              errors.push(`Ligne ${index + 1}: ${error}`);
            }
          });

          resolve({
            success: errors.length === 0,
            processed,
            skipped,
            errors,
            data: validData
          });
        },
        error: (error) => {
          resolve({
            success: false,
            processed: 0,
            skipped: 0,
            errors: [error.message],
            data: []
          });
        }
      });
    });
  }

  static exportToCSV(data: RepairerData[], filename: string) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static generateTemplate() {
    const template = [
      {
        name: 'Exemple Réparateur',
        address: '123 Rue Example',
        city: 'Paris',
        postal_code: '75001',
        phone: '01 23 45 67 89',
        email: 'contact@exemple.fr',
        website: 'www.exemple.fr',
        services: ['Réparation téléphone', 'Réparation tablette'],
        specialties: ['iPhone', 'Samsung', 'Android'],
        price_range: 'medium'
      }
    ];

    this.exportToCSV(template, 'template_repairers.csv');
  }
}
