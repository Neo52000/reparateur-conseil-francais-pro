import jsPDF from 'jspdf';
import Papa from 'papaparse';

/**
 * Exporte des données vers un fichier PDF
 */
export const exportToPDF = async (data: any, filename: string): Promise<void> => {
  const pdf = new jsPDF();
  
  // Configuration de base
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;
  
  // En-tête
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.title || 'Rapport de Ventes', margin, yPosition);
  yPosition += 15;
  
  // Date de génération
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 20;
  
  // Résumé des statistiques
  if (data.summary) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('Résumé', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    const summaryLines = [
      `Chiffre d'affaires total: ${data.summary.totalRevenue?.toLocaleString()}€`,
      `Nombre de transactions: ${data.summary.totalTransactions}`,
      `Ticket moyen: ${data.summary.avgTicket?.toFixed(2)}€`,
      `Croissance: +${data.summary.growth}%`
    ];
    
    summaryLines.forEach(line => {
      pdf.text(line, margin, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
  }
  
  // Tableau des données de ventes
  if (data.salesData && data.salesData.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('Données de ventes', margin, yPosition);
    yPosition += 15;
    
    // En-têtes du tableau
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    const headers = ['Date', 'CA (€)', 'Transactions', 'Ticket moyen (€)'];
    const colWidths = [40, 40, 40, 50];
    let xPosition = margin;
    
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 8;
    
    // Ligne de séparation
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    
    // Données
    pdf.setFont("helvetica", "normal");
    data.salesData.forEach((row: any) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      xPosition = margin;
      const values = [
        new Date(row.date).toLocaleDateString('fr-FR'),
        row.amount?.toLocaleString() || '0',
        row.transactions?.toString() || '0',
        row.avgTicket?.toFixed(2) || '0.00'
      ];
      
      values.forEach((value, index) => {
        pdf.text(value, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 6;
    });
  }
  
  // Top produits
  if (data.topProducts && data.topProducts.length > 0) {
    yPosition += 15;
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('Produits les plus vendus', margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    
    data.topProducts.forEach((product: any, index: number) => {
      const line = `${index + 1}. ${product.name} - ${product.quantity} unités - ${product.revenue?.toLocaleString()}€`;
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
  }
  
  // Sauvegarde
  pdf.save(filename);
};

/**
 * Exporte des données vers un fichier CSV
 */
export const exportToCSV = async (data: any[], filename: string): Promise<void> => {
  const csv = Papa.unparse(data);
  
  // Créer un blob et déclencher le téléchargement
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
};

/**
 * Exporte des données d'inventaire vers Excel (CSV)
 */
export const exportInventoryToCSV = async (inventoryData: any[], filename: string): Promise<void> => {
  const csvData = inventoryData.map(item => ({
    'SKU': item.sku,
    'Nom du produit': item.name,
    'Catégorie': item.category,
    'Prix unitaire': item.price,
    'Stock actuel': item.currentStock,
    'Stock minimum': item.minimumStock,
    'Statut': item.status,
    'Dernière mise à jour': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('fr-FR') : ''
  }));
  
  await exportToCSV(csvData, filename);
};

/**
 * Exporte des données de transactions vers Excel (CSV)
 */
export const exportTransactionsToCSV = async (transactionsData: any[], filename: string): Promise<void> => {
  const csvData = transactionsData.map(transaction => ({
    'Numéro de transaction': transaction.transactionNumber,
    'Date': new Date(transaction.date).toLocaleDateString('fr-FR'),
    'Client': transaction.customerName || 'Anonyme',
    'Montant total': transaction.totalAmount,
    'Montant HT': transaction.subtotal,
    'TVA': transaction.taxAmount,
    'Mode de paiement': transaction.paymentMethod,
    'Statut': transaction.status,
    'Vendeur': transaction.staffName || ''
  }));
  
  await exportToCSV(csvData, filename);
};