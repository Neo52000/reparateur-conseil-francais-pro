import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Printer, 
  ScanBarcode, 
  Bluetooth, 
  Usb, 
  Wifi,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HardwareDevice {
  id: string;
  name: string;
  type: 'printer' | 'scanner' | 'display' | 'scale';
  connection: 'usb' | 'bluetooth' | 'wifi' | 'serial';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  model?: string;
  serialNumber?: string;
  lastActivity?: string;
}

const HardwareIntegration: React.FC = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<HardwareDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [webUSBSupported, setWebUSBSupported] = useState(false);

  // Vérifier la compatibilité des APIs
  useEffect(() => {
    // Vérifier le support WebUSB
    setWebUSBSupported('usb' in navigator);
    
    // Vérifier le support Web Bluetooth
    setBluetoothSupported('bluetooth' in navigator);
    
    // Charger les périphériques simulés
    loadMockDevices();
  }, []);

  const loadMockDevices = () => {
    const mockDevices: HardwareDevice[] = [
      {
        id: '1',
        name: 'Zebra GK420t',
        type: 'printer',
        connection: 'usb',
        status: 'connected',
        model: 'GK420t',
        serialNumber: 'ZBR001234',
        lastActivity: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Scanner Honeywell',
        type: 'scanner',
        connection: 'bluetooth',
        status: 'disconnected',
        model: 'Xenon 1900',
        serialNumber: 'HON567890'
      },
      {
        id: '3',
        name: 'Afficheur client',
        type: 'display',
        connection: 'usb',
        status: 'connected',
        model: 'LCD-20x4',
        lastActivity: new Date().toISOString()
      }
    ];
    setDevices(mockDevices);
  };

  const connectUSBDevice = async () => {
    if (!webUSBSupported) {
      toast({
        title: "Non supporté",
        description: "WebUSB n'est pas supporté par ce navigateur",
        variant: "destructive"
      });
      return;
    }

    try {
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x0a5f }, // Zebra
          { vendorId: 0x04b4 }, // Cypress (scanners)
          { vendorId: 0x067b }  // Prolific (adaptateurs série)
        ]
      });

      await device.open();
      
      const newDevice: HardwareDevice = {
        id: device.serialNumber || Date.now().toString(),
        name: device.productName || 'Périphérique USB',
        type: 'printer', // À déterminer selon le périphérique
        connection: 'usb',
        status: 'connected',
        serialNumber: device.serialNumber
      };

      setDevices(prev => [...prev, newDevice]);
      
      toast({
        title: "Périphérique connecté",
        description: `${newDevice.name} a été connecté avec succès`
      });
    } catch (error) {
      console.error('Erreur de connexion USB:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de connecter le périphérique USB",
        variant: "destructive"
      });
    }
  };

  const connectBluetoothDevice = async () => {
    if (!bluetoothSupported) {
      toast({
        title: "Non supporté",
        description: "Web Bluetooth n'est pas supporté par ce navigateur",
        variant: "destructive"
      });
      return;
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Service imprimante générique
        ],
        optionalServices: ['device_information']
      });

      const server = await device.gatt.connect();
      
      const newDevice: HardwareDevice = {
        id: device.id,
        name: device.name || 'Périphérique Bluetooth',
        type: 'printer',
        connection: 'bluetooth',
        status: 'connected'
      };

      setDevices(prev => [...prev, newDevice]);
      
      toast({
        title: "Périphérique connecté",
        description: `${newDevice.name} a été connecté via Bluetooth`
      });
    } catch (error) {
      console.error('Erreur de connexion Bluetooth:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de connecter le périphérique Bluetooth",
        variant: "destructive"
      });
    }
  };

  const testDevice = async (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: 'testing' }
        : device
    ));

    // Simuler un test
    setTimeout(() => {
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, status: 'connected', lastActivity: new Date().toISOString() }
          : device
      ));

      toast({
        title: "Test réussi",
        description: "Le périphérique fonctionne correctement"
      });
    }, 2000);
  };

  const printTestReceipt = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device || device.type !== 'printer') return;

    toast({
      title: "Impression en cours",
      description: "Ticket de test en cours d'impression..."
    });

    // Simuler l'impression
    setTimeout(() => {
      setDevices(prev => prev.map(d => 
        d.id === deviceId 
          ? { ...d, lastActivity: new Date().toISOString() }
          : d
      ));

      toast({
        title: "Impression réussie",
        description: "Le ticket de test a été imprimé"
      });
    }, 1500);
  };

  const startBarcodeScan = async () => {
    if (!navigator.mediaDevices) {
      toast({
        title: "Non supporté",
        description: "Caméra non disponible sur cet appareil",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    setScanResult('');

    try {
      // Simuler la lecture d'un code-barres
      setTimeout(() => {
        const mockBarcode = `978${Math.floor(Math.random() * 1000000000)}`;
        setScanResult(mockBarcode);
        setIsScanning(false);
        
        toast({
          title: "Code-barres scanné",
          description: `Code détecté: ${mockBarcode}`
        });
      }, 3000);
    } catch (error) {
      setIsScanning(false);
      toast({
        title: "Erreur de scan",
        description: "Impossible d'accéder à la caméra",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'testing':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb':
        return <Usb className="h-4 w-4" />;
      case 'bluetooth':
        return <Bluetooth className="h-4 w-4" />;
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Intégration Matérielle
        </h2>
        <p className="text-muted-foreground">
          Gérez vos périphériques POS (imprimantes, scanners, afficheurs)
        </p>
      </div>

      {/* Compatibilité des APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>WebUSB:</strong> {webUSBSupported ? '✅ Supporté' : '❌ Non supporté'}
            {!webUSBSupported && ' (Utilisez Chrome/Edge)'}
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Web Bluetooth:</strong> {bluetoothSupported ? '✅ Supporté' : '❌ Non supporté'}
            {!bluetoothSupported && ' (Utilisez Chrome/Edge)'}
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Périphériques</TabsTrigger>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          {/* Boutons de connexion */}
          <div className="flex gap-3">
            <Button onClick={connectUSBDevice} disabled={!webUSBSupported}>
              <Usb className="h-4 w-4 mr-2" />
              Connecter USB
            </Button>
            <Button onClick={connectBluetoothDevice} disabled={!bluetoothSupported}>
              <Bluetooth className="h-4 w-4 mr-2" />
              Connecter Bluetooth
            </Button>
          </div>

          {/* Liste des périphériques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {device.type === 'printer' ? <Printer className="h-5 w-5" /> :
                       device.type === 'scanner' ? <ScanBarcode className="h-5 w-5" /> :
                       <Settings className="h-5 w-5" />}
                      {device.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(device.status)}
                      {getConnectionIcon(device.connection)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Type</Label>
                      <p className="font-medium capitalize">{device.type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Connexion</Label>
                      <p className="font-medium capitalize">{device.connection}</p>
                    </div>
                    {device.model && (
                      <div>
                        <Label className="text-muted-foreground">Modèle</Label>
                        <p className="font-medium">{device.model}</p>
                      </div>
                    )}
                    {device.serialNumber && (
                      <div>
                        <Label className="text-muted-foreground">Série</Label>
                        <p className="font-medium">{device.serialNumber}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={
                      device.status === 'connected' ? 'default' :
                      device.status === 'error' ? 'destructive' : 'secondary'
                    }>
                      {device.status === 'connected' ? 'Connecté' :
                       device.status === 'disconnected' ? 'Déconnecté' :
                       device.status === 'error' ? 'Erreur' : 'Test en cours...'}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => testDevice(device.id)}
                        disabled={device.status === 'testing'}
                      >
                        Test
                      </Button>
                      {device.type === 'printer' && (
                        <Button 
                          size="sm" 
                          onClick={() => printTestReceipt(device.id)}
                          disabled={device.status !== 'connected'}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Imprimer
                        </Button>
                      )}
                    </div>
                  </div>

                  {device.lastActivity && (
                    <p className="text-xs text-muted-foreground">
                      Dernière activité: {new Date(device.lastActivity).toLocaleString('fr-FR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanBarcode className="h-5 w-5" />
                Scanner de codes-barres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <Button 
                  onClick={startBarcodeScan}
                  disabled={isScanning}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {isScanning ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Scan en cours...
                    </>
                  ) : (
                    <>
                      <ScanBarcode className="h-5 w-5 mr-2" />
                      Démarrer le scan
                    </>
                  )}
                </Button>
                
                {scanResult && (
                  <div className="p-4 border rounded-lg">
                    <Label className="text-sm text-muted-foreground">Dernier code scanné:</Label>
                    <p className="text-lg font-mono font-bold">{scanResult}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Configuration du scanner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Son après scan</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="beep" defaultChecked />
                      <Label htmlFor="beep">Activer le bip</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Auto-ajout au panier</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-add" defaultChecked />
                      <Label htmlFor="auto-add">Ajout automatique</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Documentation et Pilotes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Imprimantes Zebra</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pilotes et documentation pour imprimantes Zebra GK420t, ZP450, etc.
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Scanners Honeywell</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configuration et pilotes pour scanners Honeywell Xenon.
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guide de Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3>Connexion USB</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Connectez votre périphérique via USB</li>
                    <li>Cliquez sur "Connecter USB" et sélectionnez le périphérique</li>
                    <li>Attendez la confirmation de connexion</li>
                    <li>Testez le périphérique avec le bouton "Test"</li>
                  </ol>

                  <h3>Connexion Bluetooth</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Activez le mode d'appairage sur votre périphérique</li>
                    <li>Cliquez sur "Connecter Bluetooth"</li>
                    <li>Sélectionnez votre périphérique dans la liste</li>
                    <li>Confirmez l'appairage</li>
                  </ol>

                  <h3>Dépannage</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Vérifiez que votre navigateur supporte WebUSB/Bluetooth</li>
                    <li>Autorisez l'accès aux périphériques dans les paramètres</li>
                    <li>Redémarrez le périphérique en cas de problème</li>
                    <li>Contactez le support technique si nécessaire</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HardwareIntegration;