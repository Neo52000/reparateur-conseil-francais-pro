import Papa from 'papaparse';

export interface SupplierCSVData {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  brands_sold: string;
  product_types: string;
  specialties: string;
  certifications: string;
  payment_terms?: string;
  minimum_order?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  delivery_standard?: string;
  delivery_express?: string;
  delivery_zones?: string;
  delivery_cost?: string;
  is_verified: boolean;
  is_featured: boolean;
  status: string;
}

export interface ImportResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
  data: any[];
}

export class SuppliersCSVService {
  /**
   * Export suppliers to CSV
   */
  static exportToCSV(suppliers: any[], filename: string = 'fournisseurs.csv') {
    console.log('📤 Export fournisseurs CSV:', { count: suppliers.length, filename });
    
    const exportData = suppliers.map(supplier => ({
      name: supplier.name,
      description: supplier.description || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      website: supplier.website || '',
      brands_sold: Array.isArray(supplier.brands_sold) ? supplier.brands_sold.join(', ') : supplier.brands_sold || '',
      product_types: Array.isArray(supplier.product_types) ? supplier.product_types.join(', ') : supplier.product_types || '',
      specialties: Array.isArray(supplier.specialties) ? supplier.specialties.join(', ') : supplier.specialties || '',
      certifications: Array.isArray(supplier.certifications) ? supplier.certifications.join(', ') : supplier.certifications || '',
      payment_terms: supplier.payment_terms || '',
      minimum_order: supplier.minimum_order?.toString() || '',
      address_street: supplier.address?.street || '',
      address_city: supplier.address?.city || '',
      address_postal_code: supplier.address?.postal_code || '',
      address_country: supplier.address?.country || '',
      delivery_standard: supplier.delivery_info?.standard || '',
      delivery_express: supplier.delivery_info?.express || '',
      delivery_zones: Array.isArray(supplier.delivery_info?.zones) ? supplier.delivery_info.zones.join(', ') : supplier.delivery_info?.zones || '',
      delivery_cost: supplier.delivery_info?.cost || '',
      is_verified: supplier.is_verified ? 'Oui' : 'Non',
      is_featured: supplier.is_featured ? 'Oui' : 'Non',
      status: supplier.status,
      rating: supplier.rating || 0,
      review_count: supplier.review_count || 0,
      created_at: new Date(supplier.created_at).toLocaleDateString('fr-FR')
    }));
    
    const csv = Papa.unparse(exportData, {
      header: true,
      delimiter: ';' // Utiliser point-virgule pour Excel français
    });
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM pour UTF-8
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Parse CSV file and validate data
   */
  static async parseFile(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const result: ImportResult = {
        success: false,
        processed: 0,
        skipped: 0,
        errors: [],
        data: []
      };

      Papa.parse(file, {
        header: true,
        delimiter: ';',
        encoding: 'UTF-8',
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => header.trim().toLowerCase(),
        complete: (results) => {
          console.log('📊 Parsing CSV results:', results);
          
          if (results.errors.length > 0) {
            result.errors.push(...results.errors.map(err => `Ligne ${err.row}: ${err.message}`));
          }

          results.data.forEach((row: any, index: number) => {
            try {
              const validated = this.validateAndTransformRow(row, index + 2); // +2 car ligne 1 = headers
              if (validated) {
                result.data.push(validated);
                result.processed++;
              } else {
                result.skipped++;
              }
            } catch (error) {
              result.errors.push(`Ligne ${index + 2}: ${error}`);
              result.skipped++;
            }
          });

          result.success = result.errors.length === 0 || result.processed > 0;
          resolve(result);
        },
        error: (error) => {
          result.errors.push(`Erreur de parsing: ${error.message}`);
          resolve(result);
        }
      });
    });
  }

  /**
   * Validate and transform a CSV row
   */
  private static validateAndTransformRow(row: any, lineNumber: number): any | null {
    // Vérifications requises
    if (!row.name || row.name.trim() === '') {
      throw new Error('Le nom du fournisseur est requis');
    }

    // Validation email si présent
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      throw new Error('Format email invalide');
    }

    // Validation URL si présente
    if (row.website && row.website.trim() && !/^https?:\/\/.+/.test(row.website)) {
      throw new Error('URL invalide (doit commencer par http:// ou https://)');
    }

    // Transformation des données
    return {
      name: row.name.trim(),
      description: row.description?.trim() || '',
      email: row.email?.trim() || '',
      phone: row.phone?.trim() || '',
      website: row.website?.trim() || '',
      brands_sold: this.parseStringArray(row.brands_sold),
      product_types: this.parseStringArray(row.product_types),
      specialties: this.parseStringArray(row.specialties),
      certifications: this.parseStringArray(row.certifications),
      payment_terms: row.payment_terms?.trim() || '',
      minimum_order: row.minimum_order ? parseFloat(row.minimum_order) : null,
      address: {
        street: row.address_street?.trim() || '',
        city: row.address_city?.trim() || '',
        postal_code: row.address_postal_code?.trim() || '',
        country: row.address_country?.trim() || 'France'
      },
      delivery_info: {
        standard: row.delivery_standard?.trim() || '',
        express: row.delivery_express?.trim() || '',
        zones: this.parseStringArray(row.delivery_zones),
        cost: row.delivery_cost?.trim() || ''
      },
      is_verified: this.parseBoolean(row.is_verified),
      is_featured: this.parseBoolean(row.is_featured),
      status: row.status?.trim() || 'active',
      rating: 0,
      review_count: 0
    };
  }

  /**
   * Parse comma-separated string to array
   */
  private static parseStringArray(value: string): string[] {
    if (!value || value.trim() === '') return [];
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  /**
   * Parse boolean from various formats
   */
  private static parseBoolean(value: string): boolean {
    if (!value) return false;
    const normalized = value.toString().toLowerCase().trim();
    return ['oui', 'yes', 'true', '1', 'vrai'].includes(normalized);
  }

  /**
   * Generate CSV template for import
   */
  static generateTemplate() {
    console.log('📋 Génération du template CSV fournisseurs');
    
    const template = [
      {
        name: 'Réparation Mobile Pro',
        description: 'Fournisseur spécialisé dans les pièces détachées smartphone et tablette',
        email: 'contact@reparation-mobile-pro.fr',
        phone: '+33 1 23 45 67 89',
        website: 'https://www.reparation-mobile-pro.fr',
        brands_sold: 'Apple, Samsung, Huawei, OnePlus',
        product_types: 'Écrans, Batteries, Connecteurs, Coques',
        specialties: 'Réparation iPhone, Livraison express, Support technique',
        certifications: 'ISO 9001, Certification Apple',
        payment_terms: '30 jours fin de mois',
        minimum_order: '100.00',
        address_street: '123 rue de la République',
        address_city: 'Paris',
        address_postal_code: '75001',
        address_country: 'France',
        delivery_standard: '24-48h',
        delivery_express: 'Même jour',
        delivery_zones: 'France, Europe',
        delivery_cost: 'Gratuit dès 100€',
        is_verified: 'Oui',
        is_featured: 'Non',
        status: 'active'
      },
      {
        name: 'Tech Parts Supplier',
        description: 'Grossiste en composants électroniques',
        email: 'info@techparts.com',
        phone: '+33 4 78 12 34 56',
        website: 'https://www.techparts.com',
        brands_sold: 'Samsung, Xiaomi, Sony',
        product_types: 'Batteries, Chargeurs, Accessoires',
        specialties: 'Prix compétitifs, Stock important',
        certifications: 'CE, RoHS',
        payment_terms: '15 jours nets',
        minimum_order: '50.00',
        address_street: '456 avenue des Champs',
        address_city: 'Lyon',
        address_postal_code: '69001',
        address_country: 'France',
        delivery_standard: '48-72h',
        delivery_express: '24h',
        delivery_zones: 'France métropolitaine',
        delivery_cost: '9.90€',
        is_verified: 'Non',
        is_featured: 'Oui',
        status: 'active'
      }
    ];

    this.exportToCSV(template, 'modele_fournisseurs.csv');
    console.log('✅ Template CSV fournisseurs généré et téléchargé');
  }
}