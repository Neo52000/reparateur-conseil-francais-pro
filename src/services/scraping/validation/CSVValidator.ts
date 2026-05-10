
/**
 * CSV data validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Free-form CSV row — every cell may be string|number|null after PapaParse;
// callers narrow per-field as needed.
export type CsvRow = Record<string, string | number | null | undefined>;

export interface ProcessedRepairerRow {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  services: string[];
  specialties: string[];
  price_range: 'low' | 'medium' | 'high';
  lat: number | null;
  lng: number | null;
}

export class CSVValidator {
  /**
   * Validate required fields for repairer data
   */
  static validateRepairerRow(row: CsvRow, index: number): ValidationResult {
    const errors: string[] = [];
    const asTrimmed = (v: string | number | null | undefined): string =>
      v == null ? '' : String(v).trim();

    // Check required fields
    if (asTrimmed(row.name).length === 0) {
      errors.push(`Ligne ${index + 1}: Le nom est obligatoire`);
    }

    if (asTrimmed(row.city).length === 0) {
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
  static processRow(row: CsvRow): ProcessedRepairerRow {
    const splitList = (val: string | number | null | undefined): string[] => {
      if (typeof val !== 'string') return [];
      return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    };
    const trimStr = (val: string | number | null | undefined): string =>
      val == null ? '' : String(val).trim();

    const priceRangeRaw = typeof row.price_range === 'string'
      ? row.price_range.toLowerCase()
      : '';
    const price_range: 'low' | 'medium' | 'high' =
      priceRangeRaw === 'low' || priceRangeRaw === 'high' ? priceRangeRaw : 'medium';

    return {
      name: trimStr(row.name),
      address: trimStr(row.address),
      city: trimStr(row.city),
      postal_code: trimStr(row.postal_code),
      phone: trimStr(row.phone),
      email: trimStr(row.email),
      website: trimStr(row.website),
      services: splitList(row.services),
      specialties: splitList(row.specialties),
      price_range,
      lat: row.lat == null ? null : parseFloat(String(row.lat)),
      lng: row.lng == null ? null : parseFloat(String(row.lng)),
    };
  }
}
