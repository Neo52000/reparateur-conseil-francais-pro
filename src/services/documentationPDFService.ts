/**
 * Service de génération PDF amélioré pour la documentation
 * Conversion markdown optimisée et styles PDF professionnels
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DocumentMetadata {
  title: string;
  subtitle: string;
  filename: string;
  lastUpdated: string;
  version: string;
}

export class DocumentationPDFService {
  private static readonly LOGO_URL = '/logo-icon.svg';
  private static readonly COMPANY_NAME = 'ReparMobile';
  private static readonly FOOTER_TEXT = 'Document généré automatiquement';

  /**
   * Génère un PDF à partir du contenu markdown
   */
  static async generatePDF(
    content: string,
    metadata: DocumentMetadata
  ): Promise<Blob> {
    // Créer un conteneur temporaire pour le rendu HTML
    const container = document.createElement('div');
    container.className = 'pdf-document-container';
    container.innerHTML = this.createHTMLTemplate(content, metadata);
    
    // Appliquer les styles
    this.applyPDFStyles(container);
    
    // Ajouter au DOM temporairement
    document.body.appendChild(container);
    
    try {
      // Générer le canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width at 96 DPI
        height: 1123, // A4 height at 96 DPI
      });
      
      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Ajouter l'image au PDF
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 dimensions
      
      // Ajouter des pages supplémentaires si nécessaire
      const pageHeight = canvas.height;
      const pdfHeight = 297;
      let remainingHeight = pageHeight;
      
      while (remainingHeight > 0) {
        pdf.addPage();
        const yOffset = pageHeight - remainingHeight;
        pdf.addImage(imgData, 'PNG', 0, -yOffset, 210, 297);
        remainingHeight -= pdfHeight;
      }
      
      return pdf.output('blob');
    } finally {
      // Nettoyer le DOM
      document.body.removeChild(container);
    }
  }

  /**
   * Télécharge un PDF généré
   */
  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Crée le template HTML pour le PDF
   */
  private static createHTMLTemplate(content: string, metadata: DocumentMetadata): string {
    return `
      <div class="pdf-page">
        <!-- En-tête -->
        <header class="pdf-header">
          <div class="header-content">
            <div class="logo-section">
              <img src="${this.LOGO_URL}" alt="${this.COMPANY_NAME}" class="logo" />
              <h1>${this.COMPANY_NAME}</h1>
            </div>
            <div class="doc-info">
              <h2>${metadata.title}</h2>
              <p>${metadata.subtitle}</p>
              <div class="meta-info">
                <span>Version: ${metadata.version}</span>
                <span>Mis à jour: ${metadata.lastUpdated}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenu principal -->
        <main class="pdf-content">
          ${this.convertMarkdownToHTML(content)}
        </main>

        <!-- Pied de page -->
        <footer class="pdf-footer">
          <div class="footer-content">
            <span>${this.FOOTER_TEXT}</span>
            <span>Page 1</span>
          </div>
        </footer>
      </div>
    `;
  }

  /**
   * Applique les styles CSS pour le PDF
   */
  private static applyPDFStyles(container: HTMLElement): void {
    const style = document.createElement('style');
    style.textContent = `
      .pdf-document-container {
        width: 794px;
        min-height: 1123px;
        background: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1a1a1a;
        padding: 0;
        margin: 0;
        position: absolute;
        left: -9999px;
        top: -9999px;
      }

      .pdf-page {
        width: 100%;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        padding: 40px;
        box-sizing: border-box;
      }

      .pdf-header {
        border-bottom: 3px solid #2563eb;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo {
        width: 40px;
        height: 40px;
      }

      .logo-section h1 {
        font-size: 24px;
        font-weight: bold;
        color: #2563eb;
        margin: 0;
      }

      .doc-info h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #1e293b;
      }

      .doc-info p {
        font-size: 14px;
        color: #64748b;
        margin: 0 0 12px 0;
      }

      .meta-info {
        display: flex;
        gap: 20px;
      }

      .meta-info span {
        font-size: 12px;
        color: #64748b;
        background: #f8fafc;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .pdf-content {
        flex: 1;
        line-height: 1.6;
      }

      .pdf-content h1 {
        font-size: 28px;
        font-weight: bold;
        color: #1e293b;
        margin: 30px 0 20px 0;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 10px;
      }

      .pdf-content h2 {
        font-size: 22px;
        font-weight: 600;
        color: #334155;
        margin: 25px 0 15px 0;
      }

      .pdf-content h3 {
        font-size: 18px;
        font-weight: 500;
        color: #475569;
        margin: 20px 0 12px 0;
      }

      .pdf-content p {
        font-size: 14px;
        line-height: 1.7;
        margin: 0 0 16px 0;
        text-align: justify;
      }

      .pdf-content ul, .pdf-content ol {
        margin: 16px 0;
        padding-left: 24px;
      }

      .pdf-content li {
        font-size: 14px;
        line-height: 1.6;
        margin: 8px 0;
      }

      .pdf-content .inline-code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #e11d48;
        font-weight: 500;
      }

      .pdf-content .code-block {
        background: #1e293b;
        border-radius: 8px;
        margin: 20px 0;
        overflow: hidden;
      }

      .pdf-content .code-block pre {
        margin: 0;
        padding: 20px;
        color: #e2e8f0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        overflow-x: auto;
      }

      .pdf-content blockquote {
        border-left: 4px solid #2563eb;
        background: #f8fafc;
        padding: 16px 20px;
        margin: 20px 0;
        font-style: italic;
        border-radius: 4px;
      }

      .pdf-content .pdf-link {
        color: #2563eb;
        text-decoration: underline;
        font-weight: 500;
      }

      .pdf-content .pdf-list {
        margin: 16px 0;
        padding-left: 24px;
      }

      .pdf-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 13px;
      }

      .pdf-content th, .pdf-content td {
        border: 1px solid #e2e8f0;
        padding: 12px;
        text-align: left;
      }

      .pdf-content th {
        background: #f8fafc;
        font-weight: 600;
        color: #1e293b;
      }

      .pdf-content h4 {
        font-size: 16px;
        font-weight: 500;
        color: #64748b;
        margin: 18px 0 10px 0;
      }

      .pdf-footer {
        border-top: 1px solid #e2e8f0;
        padding-top: 15px;
        margin-top: 30px;
      }

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #64748b;
      }
    `;
    
    document.head.appendChild(style);
    
    // Nettoyer après génération
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  }

  /**
   * Conversion Markdown vers HTML améliorée
   */
  private static convertMarkdownToHTML(markdown: string): string {
    let html = markdown;
    
    // Traitement des blocs de code
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<div class="code-block"><pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre></div>`;
    });
    
    // Code inline
    html = html.replace(/`([^`]+)`/gim, '<code class="inline-code">$1</code>');
    
    // Titres avec niveaux
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Citations
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Gras et italique
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Images avec styles
    html = html.replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, 
      '<img alt="$1" src="$2" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />');
    
    // Liens
    html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" class="pdf-link">$1</a>');
    
    // Listes numérotées
    html = html.replace(/^\d+\.\s+(.*$)/gim, '<oli>$1</oli>');
    html = html.replace(/(<oli>.*<\/oli>)/gims, match => {
      return '<ol>' + match.replace(/<\/?oli>/g, match.includes('</oli>') ? '</li>' : '<li>') + '</ol>';
    });
    
    // Listes à puces avec sous-niveaux
    html = html.replace(/^(\s*)[-*+]\s+(.*$)/gim, (match, indent, content) => {
      const level = Math.floor((indent || '').length / 2) + 1;
      return `<li data-level="${level}">${content}</li>`;
    });
    
    // Grouper les listes
    html = html.replace(/(<li[^>]*>.*<\/li>)/gims, match => {
      return '<ul class="pdf-list">' + match + '</ul>';
    });
    
    // Tables (basique)
    html = html.replace(/\|(.+)\|/gim, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
      const isHeader = match.includes('---');
      if (isHeader) return '';
      const cellTag = cells.length > 0 ? 'td' : 'th';
      return `<tr>${cells.map(cell => `<${cellTag}>${cell}</${cellTag}>`).join('')}</tr>`;
    });
    
    // Remplacer les sauts de ligne par des paragraphes
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.trim() && !paragraph.match(/^<[h1-6]|<ul|<ol|<blockquote|<div|<table/)) {
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      return paragraph;
    }).join('\n');
    
    return html;
  }

  /**
   * Génère les métadonnées par défaut avec contenu enrichi
   */
  static generateMetadata(docType: 'prd' | 'user-guide' | 'technical'): DocumentMetadata {
    const now = new Date().toLocaleDateString('fr-FR');
    
    switch (docType) {
      case 'prd':
        return {
          title: 'Product Requirements Document',
          subtitle: 'Cahier des charges complet - Plateforme ReparMobile de mise en relation réparateurs/clients',
          filename: `PRD_ReparMobile_${now.replace(/\//g, '-')}.pdf`,
          lastUpdated: now,
          version: '2.1.0'
        };
      case 'user-guide':
        return {
          title: 'Guide Utilisateur Complet',
          subtitle: 'Manuel d\'utilisation multi-rôles : Client, Réparateur, Administrateur',
          filename: `Guide_Utilisateur_ReparMobile_${now.replace(/\//g, '-')}.pdf`,
          lastUpdated: now,
          version: '2.1.0'
        };
      case 'technical':
        return {
          title: 'Documentation Technique',
          subtitle: 'Architecture système, API, Base de données & Guide développeur',
          filename: `Documentation_Technique_${now.replace(/\//g, '-')}.pdf`,
          lastUpdated: now,
          version: '2.1.0'
        };
      default:
        throw new Error('Type de document non supporté');
    }
  }
}