import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Printer,
  CreditCard,
  Scan,
  Wifi,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Monitor
} from 'lucide-react';
import { usePOSData } from '@/hooks/usePOSData';
import { toast } from 'sonner';

interface HardwareDevice {
  id: string;
  name: string;
  type: 'printer' | 'card_reader' | 'scanner' | 'display' | 'network';
  status: 'connected' | 'disconnected' | 'error' | 'warning';
  icon: React.ReactNode;
  lastSeen?: Date;
  battery?: number;
  temperature?: number;
  errorMessage?: string;
  version?: string;
}

interface SystemStatus {
  diskSpace: {
    used: number;
    total: number;
    percentage: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    connected: boolean;
    strength: number;
    type: 'wifi' | 'ethernet';
  };
  uptime: number;
}

const POSHardwareStatus: React.FC = () => {
  const [devices, setDevices] = useState<HardwareDevice[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { updateHardwareStatus } = usePOSData();

  // Données de démonstration
  const mockDevices: HardwareDevice[] = [
    {
      id: 'printer_001',
      name: 'Imprimante tickets Star TSP143',
      type: 'printer',
      status: 'connected',
      icon: <Printer className="w-5 h-5" />,
      lastSeen: new Date(),
      version: 'v2.1.3'
    },
    {
      id: 'card_reader_001',
      name: 'Terminal Ingenico iWL220',
      type: 'card_reader',
      status: 'connected',
      icon: <CreditCard className="w-5 h-5" />,
      lastSeen: new Date(),
      battery: 78,
      version: 'v1.4.2'
    },
    {
      id: 'scanner_001',
      name: 'Scanner Honeywell Voyager 1200g',
      type: 'scanner',
      status: 'warning',
      icon: <Scan className="w-5 h-5" />,
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
      errorMessage: 'Signal faible détecté'
    },
    {
      id: 'display_001',
      name: 'Écran client 15.6"',
      type: 'display',
      status: 'connected',
      icon: <Monitor className="w-5 h-5" />,
      lastSeen: new Date()
    },
    {
      id: 'network_001',
      name: 'Connexion réseau',
      type: 'network',
      status: 'connected',
      icon: <Wifi className="w-5 h-5" />,
      lastSeen: new Date()
    }
  ];

  const mockSystemStatus: SystemStatus = {
    diskSpace: {
      used: 125,
      total: 250,
      percentage: 50
    },
    memory: {
      used: 6,
      total: 16,
      percentage: 37.5
    },
    network: {
      connected: true,
      strength: 85,
      type: 'wifi'
    },
    uptime: 1440 // minutes
  };

  useEffect(() => {
    setDevices(mockDevices);
    setSystemStatus(mockSystemStatus);
  }, []);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // Update all device statuses
      for (const device of devices) {
        await updateHardwareStatus(device.name, 'operational');
      }
      
      // Mise à jour aléatoire de quelques statuts pour la démo
      const updatedDevices = devices.map(device => ({
        ...device,
        lastSeen: Math.random() > 0.8 ? new Date() : device.lastSeen,
        battery: device.battery ? Math.max(20, device.battery + (Math.random() - 0.5) * 10) : undefined
      }));
      
      setDevices(updatedDevices);
      toast.success('Statut matériel mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-admin-green text-white"><CheckCircle className="w-3 h-3 mr-1" />Connecté</Badge>;
      case 'warning':
        return <Badge className="bg-admin-orange text-white"><AlertTriangle className="w-3 h-3 mr-1" />Attention</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Erreur</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Déconnecté</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-admin-green" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-admin-orange" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return <div className="w-5 h-5 bg-muted-foreground rounded-full" />;
    }
  };

  const formatUptime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j ${hours % 24}h`;
    }
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Statut du matériel</h2>
        <Button
          variant="outline"
          onClick={refreshStatus}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statut système */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              État du système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Espace disque */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Espace disque</span>
                  <span className="text-sm text-muted-foreground">
                    {systemStatus.diskSpace.used}GB / {systemStatus.diskSpace.total}GB
                  </span>
                </div>
                <Progress value={systemStatus.diskSpace.percentage} className="h-2" />
              </div>

              {/* Mémoire */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mémoire RAM</span>
                  <span className="text-sm text-muted-foreground">
                    {systemStatus.memory.used}GB / {systemStatus.memory.total}GB
                  </span>
                </div>
                <Progress value={systemStatus.memory.percentage} className="h-2" />
              </div>

              {/* Réseau */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Signal réseau</span>
                  <span className="text-sm text-muted-foreground">
                    {systemStatus.network.strength}% ({systemStatus.network.type})
                  </span>
                </div>
                <Progress value={systemStatus.network.strength} className="h-2" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-admin-green" />
                  <span className="text-sm">Temps de fonctionnement:</span>
                </div>
                <span className="text-sm font-medium">{formatUptime(systemStatus.uptime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des périphériques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {device.icon}
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIcon(device.status)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{device.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {device.version && `Version ${device.version}`}
                    </p>
                  </div>
                </div>
                {getStatusBadge(device.status)}
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-2">
                {device.battery !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Batterie:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={device.battery} className="h-1 w-16" />
                      <span className="text-xs">{device.battery}%</span>
                    </div>
                  </div>
                )}

                {device.lastSeen && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Dernière activité:</span>
                    <span className="text-xs">
                      {device.lastSeen.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                )}

                {device.errorMessage && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    {device.errorMessage}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Configurer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default POSHardwareStatus;