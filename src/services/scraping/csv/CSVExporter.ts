
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

export class CSVExporter {
  /**
   * Export data to CSV file
   */
  static exportToCSV(data: RepairerData[], filename: string) {
    console.log('📤 Export CSV:', { data: data.length, filename });
    
    // Transform data for export (arrays to strings)
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

  /**
   * Generate and download CSV template
   */
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
