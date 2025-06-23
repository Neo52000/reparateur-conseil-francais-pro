
import Papa from 'papaparse';

export interface CSVRepairer {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string; // comma-separated
  specialties?: string; // comma-separated
  price_range?: 'low' | 'medium' | 'high';
  lat?: number;
  lng?: number;
}

export interface ImportResult {
  success: boolean;
  data: CSVRepairer[];
  errors: string[];
  skipped: number;
  processed: number;
}

export class CSVService {
  static async importFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const errors: string[] = [];
      const validData: CSVRepairer[] = [];
      let skipped = 0;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normaliser les noms de colonnes
          const headerMap: Record<string, string> = {
            'nom': 'name',
            'raison sociale': 'name',
            'adresse': 'address',
            'ville': 'city',
            'code postal': 'postal_code',
            'téléphone': 'phone',
            'telephone': 'phone',
            'email': 'email',
            'site web': 'website',
            'website': 'website',
            'services': 'services',
            'spécialités': 'specialties',
            'specialites': 'specialties',
            'prix': 'price_range',
            'latitude': 'lat',
            'longitude': 'lng'
          };
          
          return headerMap[header.toLowerCase()] || header.toLowerCase();
        },
        step: (result, parser) => {
          const row = result.data as any;
          const lineNumber = parser.cursor + 1;

          // Validation des champs obligatoires
          if (!row.name || !row.address || !row.city) {
            errors.push(`Ligne ${lineNumber}: Champs obligatoires manquants (nom, adresse, ville)`);
            skipped++;
            return;
          }

          // Validation du code postal
          const postalCode = row.postal_code || '00000';
          if (!/^\d{5}$/.test(postalCode)) {
            errors.push(`Ligne ${lineNumber}: Code postal invalide "${postalCode}"`);
            skipped++;
            return;
          }

          // Validation de l'email
          if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            errors.push(`Ligne ${lineNumber}: Email invalide "${row.email}"`);
            row.email = undefined; // On garde la ligne mais on supprime l'email invalide
          }

          // Validation du téléphone
          if (row.phone && !/^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(row.phone.replace(/\s/g, ''))) {
            errors.push(`Ligne ${lineNumber}: Téléphone invalide "${row.phone}"`);
            row.phone = undefined; // On garde la ligne mais on supprime le téléphone invalide
          }

          // Validation des coordonnées GPS
          if (row.lat) {
            const lat = parseFloat(row.lat);
            if (isNaN(lat) || lat < -90 || lat > 90) {
              errors.push(`Ligne ${lineNumber}: Latitude invalide "${row.lat}"`);
              row.lat = undefined;
            } else {
              row.lat = lat;
            }
          }

          if (row.lng) {
            const lng = parseFloat(row.lng);
            if (isNaN(lng) || lng < -180 || lng > 180) {
              errors.push(`Ligne ${lineNumber}: Longitude invalide "${row.lng}"`);
              row.lng = undefined;
            } else {
              row.lng = lng;
            }
          }

          // Validation de la gamme de prix
          if (row.price_range && !['low', 'medium', 'high'].includes(row.price_range)) {
            errors.push(`Ligne ${lineNumber}: Gamme de prix invalide "${row.price_range}"`);
            row.price_range = 'medium';
          }

          const csvRepairer: CSVRepairer = {
            name: row.name.trim(),
            address: row.address.trim(),
            city: row.city.trim(),
            postal_code: postalCode,
            phone: row.phone?.trim(),
            email: row.email?.trim(),
            website: row.website?.trim(),
            services: row.services?.trim(),
            specialties: row.specialties?.trim(),
            price_range: row.price_range || 'medium',
            lat: row.lat,
            lng: row.lng
          };

          validData.push(csvRepairer);
        },
        complete: () => {
          resolve({
            success: errors.length === 0,
            data: validData,
            errors,
            skipped,
            processed: validData.length
          });
        },
        error: (error) => {
          resolve({
            success: false,
            data: [],
            errors: [`Erreur de parsing CSV: ${error.message}`],
            skipped: 0,
            processed: 0
          });
        }
      });
    });
  }

  static exportToCSV(repairers: any[], filename: string = 'repairers.csv') {
    const csvData = repairers.map(repairer => ({
      name: repairer.name || '',
      address: repairer.address || '',
      city: repairer.city || '',
      postal_code: repairer.postal_code || '',
      phone: repairer.phone || '',
      email: repairer.email || '',
      website: repairer.website || '',
      services: Array.isArray(repairer.services) ? repairer.services.join(', ') : repairer.services || '',
      specialties: Array.isArray(repairer.specialties) ? repairer.specialties.join(', ') : repairer.specialties || '',
      price_range: repairer.price_range || 'medium',
      lat: repairer.lat || '',
      lng: repairer.lng || '',
      rating: repairer.rating || '',
      is_verified: repairer.is_verified ? 'Oui' : 'Non',
      created_at: repairer.created_at ? new Date(repairer.created_at).toLocaleDateString('fr-FR') : ''
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ',',
      quotes: true
    });

    // Télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static generateTemplate() {
    const template = [
      {
        name: 'Exemple Réparation Mobile',
        address: '123 Rue de la République',
        city: 'Paris',
        postal_code: '75001',
        phone: '01 42 00 00 00',
        email: 'contact@exemple.fr',
        website: 'https://exemple.fr',
        services: 'Réparation écran, Changement batterie',
        specialties: 'iPhone, Samsung',
        price_range: 'medium',
        lat: '48.8566',
        lng: '2.3522'
      }
    ];

    const csv = Papa.unparse(template, {
      header: true,
      delimiter: ',',
      quotes: true
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_repairers.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
