import { supabase } from '@/integrations/supabase/client';

export interface HardwareDevice {
  id: string;
  repairer_id: string;
  device_type: string;
  device_name: string;
  connection_type: string;
  configuration: any;
  is_active: boolean;
  last_connected?: string;
  created_at: string;
  updated_at: string;
}

export interface ScanResult {
  barcode: string;
  format: string;
  timestamp: string;
}

export interface PrintJob {
  type: 'receipt' | 'label' | 'report';
  content: string;
  options?: {
    copies?: number;
    paper_size?: string;
    font_size?: number;
  };
}

export interface CashDrawerStatus {
  is_open: boolean;
  last_opened?: string;
  last_closed?: string;
}

// Types pour Web APIs
declare global {
  interface Navigator {
    serial?: {
      requestPort(): Promise<SerialPort>;
      getPorts(): Promise<SerialPort[]>;
    };
    usb?: {
      requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
      getDevices(): Promise<USBDevice[]>;
    };
  }
}

interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream;
  writable: WritableStream;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
}

interface USBDevice {
  open(): Promise<void>;
  close(): Promise<void>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[];
}

interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
}

interface USBInTransferResult {
  data: DataView;
  status: 'ok' | 'stall' | 'babble';
}

interface USBOutTransferResult {
  bytesWritten: number;
  status: 'ok' | 'stall' | 'babble';
}

export class HardwareIntegrationService {
  private static connectedDevices = new Map<string, any>();
  private static scannerCallback?: (result: ScanResult) => void;

  /**
   * Obtenir les appareils configurés pour un réparateur
   */
  static async getConfiguredDevices(repairerId: string): Promise<HardwareDevice[]> {
    try {
      const { data, error } = await supabase
        .from('pos_hardware_config')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('device_type');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération appareils:', error);
      throw error;
    }
  }

  /**
   * Configurer un nouvel appareil
   */
  static async configureDevice(repairerId: string, deviceData: Omit<HardwareDevice, 'id' | 'repairer_id' | 'created_at' | 'updated_at'>): Promise<HardwareDevice> {
    try {
      const { data, error } = await supabase
        .from('pos_hardware_config')
        .insert({
          repairer_id: repairerId,
          ...deviceData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur configuration appareil:', error);
      throw error;
    }
  }

  /**
   * Détecter les appareils USB disponibles
   */
  static async detectUSBDevices(): Promise<{ name: string; vendorId: number; productId: number }[]> {
    try {
      if (!navigator.usb) {
        throw new Error('USB API non supportée par ce navigateur');
      }

      const devices = await navigator.usb.getDevices();
      return devices.map(device => ({
        name: (device as any).productName || 'Appareil USB inconnu',
        vendorId: (device as any).vendorId || 0,
        productId: (device as any).productId || 0
      }));
    } catch (error) {
      console.error('Erreur détection USB:', error);
      return [];
    }
  }

  /**
   * Connecter un scanner de codes-barres
   */
  static async connectBarcodeScanner(deviceConfig: HardwareDevice): Promise<boolean> {
    try {
      if (deviceConfig.connection_type === 'usb') {
        return await this.connectUSBScanner(deviceConfig);
      } else if (deviceConfig.connection_type === 'serial') {
        return await this.connectSerialScanner(deviceConfig);
      }
      
      throw new Error(`Type de connexion non supporté: ${deviceConfig.connection_type}`);
    } catch (error) {
      console.error('Erreur connexion scanner:', error);
      return false;
    }
  }

  /**
   * Configurer le callback pour les scans
   */
  static setScannerCallback(callback: (result: ScanResult) => void): void {
    this.scannerCallback = callback;
  }

  /**
   * Connecter une imprimante thermique
   */
  static async connectThermalPrinter(deviceConfig: HardwareDevice): Promise<boolean> {
    try {
      if (!navigator.usb) {
        throw new Error('USB API non supportée');
      }

      const device = await navigator.usb.requestDevice({
        filters: [{
          vendorId: deviceConfig.configuration.vendorId || 0x04b8, // Epson par défaut
          productId: deviceConfig.configuration.productId || 0x0202
        }]
      });

      await device.open();
      
      this.connectedDevices.set(`printer_${deviceConfig.id}`, device);
      
      // Mettre à jour le statut de connexion
      await this.updateDeviceStatus(deviceConfig.id, true);
      
      return true;
    } catch (error) {
      console.error('Erreur connexion imprimante:', error);
      return false;
    }
  }

  /**
   * Imprimer un reçu
   */
  static async printReceipt(deviceId: string, receiptData: any): Promise<boolean> {
    try {
      const printer = this.connectedDevices.get(`printer_${deviceId}`);
      if (!printer) {
        throw new Error('Imprimante non connectée');
      }

      const receiptContent = this.formatReceiptContent(receiptData);
      const commands = this.generateESCPOSCommands(receiptContent);
      
      await printer.transferOut(1, new TextEncoder().encode(commands));
      
      return true;
    } catch (error) {
      console.error('Erreur impression:', error);
      return false;
    }
  }

  /**
   * Ouvrir le tiroir-caisse
   */
  static async openCashDrawer(deviceId: string): Promise<boolean> {
    try {
      const printer = this.connectedDevices.get(`printer_${deviceId}`);
      if (!printer) {
        throw new Error('Imprimante/tiroir non connecté');
      }

      // Commande ESC/POS pour ouvrir le tiroir-caisse
      const openDrawerCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
      await printer.transferOut(1, openDrawerCommand);
      
      return true;
    } catch (error) {
      console.error('Erreur ouverture tiroir:', error);
      return false;
    }
  }

  /**
   * Connecter une balance
   */
  static async connectScale(deviceConfig: HardwareDevice): Promise<boolean> {
    try {
      if (deviceConfig.connection_type === 'serial') {
        return await this.connectSerialScale(deviceConfig);
      }
      
      throw new Error(`Type de connexion non supporté pour la balance: ${deviceConfig.connection_type}`);
    } catch (error) {
      console.error('Erreur connexion balance:', error);
      return false;
    }
  }

  /**
   * Lire le poids depuis la balance
   */
  static async readWeight(deviceId: string): Promise<{ weight: number; unit: string } | null> {
    try {
      const scale = this.connectedDevices.get(`scale_${deviceId}`);
      if (!scale) {
        throw new Error('Balance non connectée');
      }

      // Envoyer commande de lecture du poids
      const reader = scale.readable.getReader();
      const { value } = await reader.read();
      reader.releaseLock();

      // Parser la réponse selon le protocole de la balance
      const weightData = this.parseWeightData(value);
      return weightData;
    } catch (error) {
      console.error('Erreur lecture poids:', error);
      return null;
    }
  }

  /**
   * Tester la connectivité d'un appareil
   */
  static async testDeviceConnectivity(deviceId: string): Promise<{ connected: boolean; lastTest: string; error?: string }> {
    try {
      const device = this.connectedDevices.get(deviceId);
      const connected = device !== undefined;
      
      await this.updateDeviceStatus(deviceId, connected);
      
      return {
        connected,
        lastTest: new Date().toISOString(),
        error: connected ? undefined : 'Appareil non connecté'
      };
    } catch (error) {
      return {
        connected: false,
        lastTest: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Déconnecter tous les appareils
   */
  static async disconnectAllDevices(): Promise<void> {
    try {
      for (const [deviceId, device] of this.connectedDevices.entries()) {
        try {
          if (device.close) {
            await device.close();
          }
        } catch (error) {
          console.error(`Erreur déconnexion ${deviceId}:`, error);
        }
      }
      
      this.connectedDevices.clear();
    } catch (error) {
      console.error('Erreur déconnexion générale:', error);
    }
  }

  // Méthodes privées

  private static async connectUSBScanner(deviceConfig: HardwareDevice): Promise<boolean> {
    try {
      if (!navigator.usb) {
        throw new Error('USB API non supportée');
      }

      const device = await navigator.usb.requestDevice({
        filters: [{
          vendorId: deviceConfig.configuration.vendorId || 0x05e0, // Symbol/Zebra par défaut
          productId: deviceConfig.configuration.productId || 0x1200
        }]
      });

      await device.open();
      
      // Configurer la lecture des données
      this.setupUSBScannerReading(device);
      
      this.connectedDevices.set(`scanner_${deviceConfig.id}`, device);
      await this.updateDeviceStatus(deviceConfig.id, true);
      
      return true;
    } catch (error) {
      console.error('Erreur connexion scanner USB:', error);
      return false;
    }
  }

  private static async connectSerialScanner(deviceConfig: HardwareDevice): Promise<boolean> {
    try {
      if (!navigator.serial) {
        throw new Error('Serial API non supportée');
      }

      const port = await navigator.serial.requestPort();
      await port.open({
        baudRate: deviceConfig.configuration.baudRate || 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.setupSerialScannerReading(port);
      
      this.connectedDevices.set(`scanner_${deviceConfig.id}`, port);
      await this.updateDeviceStatus(deviceConfig.id, true);
      
      return true;
    } catch (error) {
      console.error('Erreur connexion scanner série:', error);
      return false;
    }
  }

  private static async connectSerialScale(deviceConfig: HardwareDevice): Promise<boolean> {
    try {
      if (!navigator.serial) {
        throw new Error('Serial API non supportée');
      }

      const port = await navigator.serial.requestPort();
      await port.open({
        baudRate: deviceConfig.configuration.baudRate || 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.connectedDevices.set(`scale_${deviceConfig.id}`, port);
      await this.updateDeviceStatus(deviceConfig.id, true);
      
      return true;
    } catch (error) {
      console.error('Erreur connexion balance série:', error);
      return false;
    }
  }

  private static setupUSBScannerReading(device: USBDevice): void {
    // Configuration pour la lecture continue depuis le scanner USB
    const readLoop = async () => {
      try {
        const result = await device.transferIn(1, 64);
        if (result.data && result.data.byteLength > 0) {
          const barcode = new TextDecoder().decode(result.data).trim();
          if (barcode && this.scannerCallback) {
            this.scannerCallback({
              barcode,
              format: 'unknown',
              timestamp: new Date().toISOString()
            });
          }
        }
        // Continuer la lecture
        setTimeout(readLoop, 100);
      } catch (error) {
        console.error('Erreur lecture scanner USB:', error);
      }
    };
    
    readLoop();
  }

  private static setupSerialScannerReading(port: SerialPort): void {
    const reader = port.readable?.getReader();
    if (!reader) return;

    const readLoop = async () => {
      try {
        const { value, done } = await reader.read();
        if (done) return;

        const barcode = new TextDecoder().decode(value).trim();
        if (barcode && this.scannerCallback) {
          this.scannerCallback({
            barcode,
            format: 'unknown',
            timestamp: new Date().toISOString()
          });
        }
        
        readLoop();
      } catch (error) {
        console.error('Erreur lecture scanner série:', error);
      }
    };
    
    readLoop();
  }

  private static formatReceiptContent(receiptData: any): string {
    // Formater le contenu du reçu selon les données de transaction
    let content = '';
    content += `${receiptData.businessName}\n`;
    content += `${receiptData.address}\n`;
    content += `Tel: ${receiptData.phone}\n`;
    content += `\n`;
    content += `Date: ${new Date(receiptData.date).toLocaleDateString()}\n`;
    content += `Caissier: ${receiptData.cashier}\n`;
    content += `\n`;
    content += `--------------------------------\n`;
    
    receiptData.items.forEach((item: any) => {
      content += `${item.name}\n`;
      content += `${item.quantity} x ${item.price}€ = ${(item.quantity * item.price).toFixed(2)}€\n`;
      content += `\n`;
    });
    
    content += `--------------------------------\n`;
    content += `Sous-total: ${receiptData.subtotal.toFixed(2)}€\n`;
    content += `TVA: ${receiptData.tax.toFixed(2)}€\n`;
    content += `Total: ${receiptData.total.toFixed(2)}€\n`;
    content += `\n`;
    content += `Paiement: ${receiptData.paymentMethod}\n`;
    content += `\n`;
    content += `Merci de votre visite!\n`;
    
    return content;
  }

  private static generateESCPOSCommands(content: string): string {
    // Générer les commandes ESC/POS pour l'impression
    let commands = '';
    commands += '\x1B\x40'; // Initialiser l'imprimante
    commands += '\x1B\x61\x01'; // Centrer le texte
    commands += content;
    commands += '\x0A\x0A\x0A'; // Saut de lignes
    commands += '\x1D\x56\x42\x00'; // Couper le papier
    
    return commands;
  }

  private static parseWeightData(data: Uint8Array): { weight: number; unit: string } | null {
    try {
      // Parser selon le protocole de la balance (exemple générique)
      const text = new TextDecoder().decode(data);
      const match = text.match(/(\d+\.?\d*)\s*(kg|g|lb)/i);
      
      if (match) {
        return {
          weight: parseFloat(match[1]),
          unit: match[2].toLowerCase()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur parsing poids:', error);
      return null;
    }
  }

  private static async updateDeviceStatus(deviceId: string, connected: boolean): Promise<void> {
    try {
      await supabase
        .from('pos_hardware_config')
        .update({
          last_connected: connected ? new Date().toISOString() : undefined
        })
        .eq('id', deviceId);
    } catch (error) {
      console.error('Erreur mise à jour statut appareil:', error);
    }
  }
}