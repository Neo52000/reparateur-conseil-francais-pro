
/**
 * CSV data validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class CSVValidator {
  /**
   * Validate required fields for repairer data
   */
  static validateRepairerRow(row: any, index: number): ValidationResult {
    const errors: string[] = [];
    
    // Check required fields
    if (!row.name || row.name.trim().length === 0) {
      errors.push(`Ligne ${index + 1}: Le nom est obligatoire`);
    }

    if (!row.city || row.city.trim().length === 0) {
      errors.push(`Ligne ${index + 1}: La ville est obligatoire`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clean and process row data
   */
  static processRow(row: any): any {
    return {
      name: row.name ? row.name.trim() : '',
      address: row.address ? row.address.trim() : '',
      city: row.city ? row.city.trim() : '',
      postal_code: row.postal_code ? row.postal_code.toString().trim() : '',
      phone: row.phone ? row.phone.toString().trim() : '',
      email: row.email ? row.email.trim() : '',
      website: row.website ? row.website.trim() : '',
      services: row.services ? 
        row.services.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : 
        [],
      specialties: row.specialties ? 
        row.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : 
        [],
      price_range: row.price_range && ['low', 'medium', 'high'].includes(row.price_range.toString().toLowerCase()) 
        ? row.price_range.toString().toLowerCase() 
        : 'medium',
      lat: row.lat ? parseFloat(row.lat.toString()) : null,
      lng: row.lng ? parseFloat(row.lng.toString()) : null
    };
  }
}
