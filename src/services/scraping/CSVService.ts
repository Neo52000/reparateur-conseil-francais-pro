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
  // Fonction pour corriger les caractères mal encodés
  static fixEncoding(text: string): string {
    if (!text || typeof text !== 'string') return text;
    
    // Dictionnaire des caractères mal encodés courants
    const encodingFixes: { [key: string]: string } = {
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
      'Ã': 'À',
      'Ã‰': 'É',
      'Ã‡': 'Ç',
      'Ã'': 'Ñ',
      '': 'é', // Caractère de remplacement générique
      'rÃ©parateur': 'réparateur',
      'rÃ©paration': 'réparation',
      'tÃ©lÃ©phone': 'téléphone',
      'Ã©lectronique': 'électronique',
      'prÃ©cision': 'précision',
      'qualitÃ©': 'qualité',
      'spÃ©cialitÃ©': 'spécialité',
      'expÃ©rience': 'expérience'
    };

    let fixedText = text;
    
    // Remplacer tous les caractères mal encodés
    Object.keys(encodingFixes).forEach(badChar => {
      const regex = new RegExp(badChar, 'g');
      fixedText = fixedText.replace(regex, encodingFixes[badChar]);
    });

    return fixedText;
  }

  static async importFromFile(file: File): Promise<ImportResult> {
    console.log('📄 CSVService: Début du parsing du fichier:', file.name);
    
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
              // Appliquer la correction d'encodage sur tous les champs texte
              const fixedRow = {
                ...row,
                name: row.name ? this.fixEncoding(row.name.toString()) : '',
                address: row.address ? this.fixEncoding(row.address.toString()) : '',
                city: row.city ? this.fixEncoding(row.city.toString()) : '',
                services: row.services ? this.fixEncoding(row.services.toString()) : '',
                specialties: row.specialties ? this.fixEncoding(row.specialties.toString()) : '',
                email: row.email ? this.fixEncoding(row.email.toString()) : '',
                website: row.website ? this.fixEncoding(row.website.toString()) : ''
              };

              // Vérifier les champs obligatoires
              if (!fixedRow.name || fixedRow.name.trim().length === 0) {
                console.log(`⚠️ Ligne ${index + 1}: Nom manquant ou invalide`);
                skipped++;
                errors.push(`Ligne ${index + 1}: Le nom est obligatoire`);
                return;
              }

              if (!fixedRow.city || fixedRow.city.trim().length === 0) {
                console.log(`⚠️ Ligne ${index + 1}: Ville manquante ou invalide`);
                skipped++;
                errors.push(`Ligne ${index + 1}: La ville est obligatoire`);
                return;
              }
              
              // Nettoyer et valider les données
              const processedRow = {
                name: fixedRow.name.trim(),
                address: fixedRow.address.trim(),
                city: fixedRow.city.trim(),
                postal_code: row.postal_code ? row.postal_code.toString().trim() : '',
                phone: row.phone ? row.phone.toString().trim() : '',
                email: fixedRow.email.trim(),
                website: fixedRow.website.trim(),
                services: fixedRow.services ? fixedRow.services.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
                specialties: fixedRow.specialties ? fixedRow.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
                price_range: row.price_range && ['low', 'medium', 'high'].includes(row.price_range.toString().toLowerCase()) 
                  ? row.price_range.toString().toLowerCase() 
                  : 'medium',
                lat: row.lat ? parseFloat(row.lat.toString()) : null,
                lng: row.lng ? parseFloat(row.lng.toString()) : null
              };
              
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

          console.log('📊 Résultat final CSVService:', result);
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

  static exportToCSV(data: RepairerData[], filename: string) {
    console.log('📤 Export CSV:', { data: data.length, filename });
    
    // Transformer les données pour l'export (tableaux en chaînes)
    const exportData = data.map(item => ({
      ...item,
      services: Array.isArray(item.services) ? item.services.join(',') : item.services,
      specialties: Array.isArray(item.specialties) ? item.specialties.join(',') : item.specialties
    }));
    
    const csv = Papa.unparse(exportData);
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
    console.log('📋 Génération du template CSV');
    
    const template = [
      {
        name: 'Réparateur Mobile Pro',
        address: '123 Rue de la République',
        city: 'Paris',
        postal_code: '75001',
        phone: '01 23 45 67 89',
        email: 'contact@reparateur-pro.fr',
        website: 'www.reparateur-pro.fr',
        services: ['Réparation téléphone', 'Réparation tablette', 'Changement écran'],
        specialties: ['iPhone', 'Samsung', 'Huawei', 'OnePlus'],
        price_range: 'medium'
      },
      {
        name: 'iTech Réparation',
        address: '456 Avenue des Champs',
        city: 'Lyon',
        postal_code: '69001',
        phone: '04 78 12 34 56',
        email: 'info@itech-reparation.com',
        website: 'www.itech-reparation.com',
        services: ['Réparation smartphone', 'Déblocage téléphone', 'Récupération données'],
        specialties: ['Apple', 'Android', 'Écrans OLED'],
        price_range: 'high'
      }
    ];

    this.exportToCSV(template, 'modele_repairers.csv');
    console.log('✅ Template CSV généré et téléchargé');
  }
}
