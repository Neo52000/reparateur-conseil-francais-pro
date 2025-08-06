import React from 'react';
import { RepairOrder } from '@/hooks/useRepairManagement';
import QRCode from 'qrcode';

interface RepairTicketGeneratorProps {
  repairOrder: RepairOrder;
}

export const generateRepairTicket = async (repairOrder: RepairOrder) => {
  try {
    // Générer le QR code de suivi
    const trackingUrl = `${window.location.origin}/tracking/${repairOrder.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 150,
      margin: 1,
    });

    // Générer le HTML du bon de prise en charge
    const ticketHTML = generateTicketHTML(repairOrder, qrCodeDataUrl);
    
    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    // Générer et imprimer l'étiquette atelier
    generateWorkshopLabel(repairOrder, qrCodeDataUrl);
    
  } catch (error) {
    console.error('Erreur lors de la génération du bon:', error);
  }
};

const generateTicketHTML = (repairOrder: RepairOrder, qrCodeDataUrl: string) => {
  const device = repairOrder.device;
  const currentDate = new Date().toLocaleDateString('fr-FR');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bon de Prise en Charge - ${repairOrder.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 12px; 
          line-height: 1.4;
          color: #333;
        }
        .page { 
          width: 210mm; 
          min-height: 297mm; 
          padding: 20mm;
          margin: 0 auto;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 15px; 
          margin-bottom: 20px;
        }
        .company-name { 
          font-size: 24px; 
          font-weight: bold; 
          margin-bottom: 5px;
        }
        .document-title { 
          font-size: 18px; 
          font-weight: bold; 
          margin-top: 10px;
        }
        .order-number { 
          font-size: 16px; 
          color: #666; 
          margin-top: 5px;
        }
        .section { 
          margin-bottom: 20px; 
          border: 1px solid #ddd; 
          padding: 15px;
        }
        .section-title { 
          font-size: 14px; 
          font-weight: bold; 
          margin-bottom: 10px; 
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px;
        }
        .field { 
          margin-bottom: 8px;
        }
        .field-label { 
          font-weight: bold; 
          display: inline-block; 
          width: 120px;
        }
        .field-value { 
          display: inline-block;
        }
        .divider { 
          border-top: 1px dashed #999; 
          margin: 30px 0; 
          text-align: center;
          position: relative;
        }
        .divider::after {
          content: "✂ DÉCOUPER ICI ✂";
          background: white;
          padding: 0 10px;
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: #999;
        }
        .qr-section { 
          text-align: center; 
          margin: 20px 0;
        }
        .qr-code { 
          margin: 10px 0;
        }
        .tracking-info { 
          font-size: 10px; 
          color: #666; 
          margin-top: 10px;
        }
        .signature-section { 
          margin-top: 30px;
        }
        .signature-box { 
          border: 1px solid #333; 
          height: 60px; 
          margin-top: 10px;
          position: relative;
        }
        .signature-label { 
          position: absolute; 
          bottom: -20px; 
          font-size: 10px;
        }
        .security-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 10px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .security-warning strong {
          color: #856404;
        }
        @media print {
          .page { margin: 0; }
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- COPIE RÉPARATEUR -->
        <div class="header">
          <div class="company-name">RÉPARATION MOBILE</div>
          <div class="document-title">BON DE PRISE EN CHARGE</div>
          <div class="order-number">N° ${repairOrder.order_number}</div>
          <div>Date: ${currentDate}</div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="section-title">📱 INFORMATIONS APPAREIL</div>
            <div class="field">
              <span class="field-label">Type:</span>
              <span class="field-value">${device?.custom_device_info || 'Non spécifié'}</span>
            </div>
            ${device?.imei_serial ? `
            <div class="field">
              <span class="field-label">IMEI/Série:</span>
              <span class="field-value">${device.imei_serial}</span>
            </div>` : ''}
            <div class="field">
              <span class="field-label">Problème:</span>
              <span class="field-value">${device?.initial_diagnosis || 'À diagnostiquer'}</span>
            </div>
            ${device?.estimated_cost ? `
            <div class="field">
              <span class="field-label">Estimation:</span>
              <span class="field-value">${device.estimated_cost}€</span>
            </div>` : ''}
            ${device?.accessories && device.accessories.length > 0 ? `
            <div class="field">
              <span class="field-label">Accessoires:</span>
              <span class="field-value">${device.accessories.join(', ')}</span>
            </div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">👤 INFORMATIONS CLIENT</div>
            <div class="field">
              <span class="field-label">Nom:</span>
              <span class="field-value">${device?.customer_name}</span>
            </div>
            ${device?.customer_phone ? `
            <div class="field">
              <span class="field-label">Téléphone:</span>
              <span class="field-value">${device.customer_phone}</span>
            </div>` : ''}
            ${device?.customer_email ? `
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${device.customer_email}</span>
            </div>` : ''}
            ${device?.customer_notes ? `
            <div class="field">
              <span class="field-label">Notes:</span>
              <span class="field-value">${device.customer_notes}</span>
            </div>` : ''}
          </div>
        </div>

        ${(device?.pin_code || device?.sim_code || device?.lock_pattern) ? `
        <div class="security-warning">
          <strong>⚠️ CODES DE SÉCURITÉ:</strong>
          ${device?.pin_code ? `PIN Appareil: ${device.pin_code} | ` : ''}
          ${device?.sim_code ? `PIN SIM: ${device.sim_code} | ` : ''}
          ${device?.lock_pattern ? `Modèle: ${device.lock_pattern}` : ''}
          ${device?.security_notes ? `<br>Notes: ${device.security_notes}` : ''}
        </div>` : ''}

        <div class="section">
          <div class="section-title">📋 CONDITIONS DE PRISE EN CHARGE</div>
          <div style="font-size: 11px; line-height: 1.6;">
            ✓ L'appareil est pris en charge pour diagnostic et réparation<br>
            ✓ Un devis vous sera communiqué avant toute intervention<br>
            ✓ Les codes fournis restent confidentiels et sécurisés<br>
            ✓ Délai maximum de réclamation: 7 jours après récupération<br>
            ✓ En cas de non-récupération sous 3 mois, frais de stockage applicables
          </div>
        </div>

        <div class="signature-section">
          <div class="grid">
            <div>
              <strong>Signature Client:</strong>
              <div class="signature-box">
                <span class="signature-label">Date et signature obligatoires</span>
              </div>
            </div>
            <div>
              <strong>Signature Réparateur:</strong>
              <div class="signature-box">
                <span class="signature-label">Cachet et signature</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SÉPARATEUR -->
        <div class="divider"></div>

        <!-- COPIE CLIENT -->
        <div class="header">
          <div class="company-name">RÉPARATION MOBILE</div>
          <div class="document-title">REÇU DE DÉPÔT</div>
          <div class="order-number">N° ${repairOrder.order_number}</div>
          <div>Date: ${currentDate}</div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="section-title">📱 VOTRE APPAREIL</div>
            <div class="field">
              <span class="field-label">Type:</span>
              <span class="field-value">${device?.custom_device_info || 'Non spécifié'}</span>
            </div>
            <div class="field">
              <span class="field-label">Problème:</span>
              <span class="field-value">${device?.initial_diagnosis || 'À diagnostiquer'}</span>
            </div>
            ${device?.estimated_cost ? `
            <div class="field">
              <span class="field-label">Estimation:</span>
              <span class="field-value">${device.estimated_cost}€</span>
            </div>` : ''}
          </div>

          <div class="qr-section">
            <div class="section-title">📱 SUIVI EN LIGNE</div>
            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="QR Code de suivi" />
            </div>
            <div><strong>Scannez pour suivre votre réparation</strong></div>
            <div class="tracking-info">
              Ou rendez-vous sur:<br>
              ${window.location.origin}/tracking/${repairOrder.id}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📞 CONTACT</div>
          <div style="text-align: center;">
            <div><strong>Téléphone:</strong> 01 23 45 67 89</div>
            <div><strong>Email:</strong> contact@reparation-mobile.fr</div>
            <div><strong>Horaires:</strong> Lun-Ven 9h-18h, Sam 9h-17h</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateWorkshopLabel = (repairOrder: RepairOrder, qrCodeDataUrl: string) => {
  const labelHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Étiquette Atelier - ${repairOrder.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 10px;
          color: #333;
        }
        .label { 
          width: 10cm; 
          height: 6cm; 
          border: 2px solid #333; 
          padding: 8px;
          margin: 10px;
          display: flex;
          flex-direction: column;
        }
        .label-header { 
          text-align: center; 
          font-weight: bold; 
          font-size: 12px; 
          margin-bottom: 8px;
          border-bottom: 1px solid #333;
          padding-bottom: 4px;
        }
        .label-content { 
          flex: 1; 
          display: grid; 
          grid-template-columns: 1fr 60px; 
          gap: 8px;
        }
        .info { 
          font-size: 9px;
        }
        .info div { 
          margin-bottom: 3px;
        }
        .qr-mini { 
          text-align: center;
        }
        .qr-mini img { 
          width: 50px; 
          height: 50px;
        }
        .priority { 
          background: #ff6b6b; 
          color: white; 
          padding: 2px 6px; 
          border-radius: 3px; 
          font-size: 8px; 
          display: inline-block;
        }
        @media print {
          body { margin: 0; }
          .label { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="label-header">
          ATELIER - ${repairOrder.order_number}
        </div>
        <div class="label-content">
          <div class="info">
            <div><strong>${repairOrder.device?.customer_name}</strong></div>
            <div>📱 ${repairOrder.device?.custom_device_info || 'N/A'}</div>
            <div>🔧 ${repairOrder.device?.initial_diagnosis || 'Diagnostic'}</div>
            ${repairOrder.device?.estimated_cost ? `<div>💰 ${repairOrder.device.estimated_cost}€</div>` : ''}
            <div class="priority">PRIORITÉ ${repairOrder.priority}</div>
          </div>
          <div class="qr-mini">
            <img src="${qrCodeDataUrl}" alt="QR" />
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Open label window immediately using requestAnimationFrame
  requestAnimationFrame(() => {
    const labelWindow = window.open('', '_blank', 'width=400,height=300');
    if (labelWindow) {
      labelWindow.document.write(labelHTML);
      labelWindow.document.close();
      labelWindow.onload = () => {
        labelWindow.print();
      };
    }
  });
};

// Export the main function
// Component is not needed as we're only exporting the function