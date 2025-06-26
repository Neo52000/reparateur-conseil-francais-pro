
// Main CSV service that orchestrates parsing and exporting
import { CSVParser, ImportResult } from './csv/CSVParser';
import { CSVExporter } from './csv/CSVExporter';

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

export { ImportResult };

export class CSVService {
  /**
   * Import repairers from CSV file
   */
  static async importFromFile(file: File): Promise<ImportResult> {
    return CSVParser.parseFile(file);
  }

  /**
   * Export repairers to CSV file
   */
  static exportToCSV(data: RepairerData[], filename: string) {
    CSVExporter.exportToCSV(data, filename);
  }

  /**
   * Generate and download CSV template
   */
  static generateTemplate() {
    CSVExporter.generateTemplate();
  }
}
