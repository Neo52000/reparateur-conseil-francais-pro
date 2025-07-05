import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Settings,
  Wifi,
  Database,
  FileText,
  Activity
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'permission_denied' | 'data_access' | 'session_timeout';
  timestamp: string;
  user_id: string;
  ip_address: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecuritySettings {
  session_timeout: number;
  max_failed_attempts: number;
  require_pin_for_voids: boolean;
  require_pin_for_discounts: boolean;
  automatic_logout: boolean;
  audit_all_actions: boolean;
  encrypt_transactions: boolean;
  secure_network_only: boolean;
}

interface SecurityControlsProps {
  repairerId?: string;
}

const SecurityControls: React.FC<SecurityControlsProps> = ({ repairerId }) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    session_timeout: 30,
    max_failed_attempts: 3,
    require_pin_for_voids: true,
    require_pin_for_discounts: true,
    automatic_logout: true,
    audit_all_actions: true,
    encrypt_transactions: true,
    secure_network_only: false
  });
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Simulation des événements de sécurité
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login',
        timestamp: new Date().toISOString(),
        user_id: 'demo-user',
        ip_address: '192.168.1.100',
        details: 'Connexion réussie',
        severity: 'low'
      },
      {
        id: '2',
        type: 'failed_login',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        user_id: 'unknown',
        ip_address: '192.168.1.150',
        details: 'Tentative de connexion échouée (3 essais)',
        severity: 'high'
      },
      {
        id: '3',
        type: 'permission_denied',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        user_id: 'demo-user',
        ip_address: '192.168.1.100',
        details: 'Tentative d\'accès aux paramètres administrateur',
        severity: 'medium'
      },
      {
        id: '4',
        type: 'data_access',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        user_id: 'demo-user',
        ip_address: '192.168.1.100',
        details: 'Consultation des rapports de vente',
        severity: 'low'
      }
    ];

    setSecurityEvents(mockEvents);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'failed_login': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'permission_denied': return <Shield className="w-4 h-4 text-yellow-600" />;
      case 'data_access': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'session_timeout': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Ici on enverrait les changements au serveur
    console.log(`Paramètre de sécurité modifié: ${key} = ${value}`);
  };

  const changePin = () => {
    if (newPin !== confirmPin) {
      alert('Les codes PIN ne correspondent pas');
      return;
    }
    
    if (newPin.length !== 4) {
      alert('Le code PIN doit contenir 4 chiffres');
      return;
    }

    // Ici on enverrait le nouveau PIN au serveur
    console.log('Code PIN changé avec succès');
    setShowPinDialog(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const getSecurityScore = () => {
    let score = 0;
    if (securitySettings.require_pin_for_voids) score += 15;
    if (securitySettings.require_pin_for_discounts) score += 15;
    if (securitySettings.automatic_logout) score += 20;
    if (securitySettings.audit_all_actions) score += 20;
    if (securitySettings.encrypt_transactions) score += 20;
    if (securitySettings.session_timeout <= 30) score += 10;
    return score;
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Contrôles de Sécurité</h2>
            <p className="text-sm text-muted-foreground">
              Sécurisation et conformité NF-525
            </p>
          </div>
        </div>
        
        <Card className="px-4 py-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              securityScore >= 80 ? 'bg-emerald-500' : 
              securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="font-bold text-lg">{securityScore}%</span>
            <span className="text-sm text-muted-foreground">Score sécurité</span>
          </div>
        </Card>
      </div>

      {/* Alertes de sécurité */}
      <div className="grid grid-cols-3 gap-4">
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800">
            <strong>Connexion sécurisée</strong><br />
            Session chiffrée HTTPS active
          </AlertDescription>
        </Alert>
        
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Tentative d'intrusion</strong><br />
            3 connexions échouées détectées
          </AlertDescription>
        </Alert>
        
        <Alert className="border-blue-200 bg-blue-50">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Sauvegarde</strong><br />
            Dernière sauvegarde: il y a 2h
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Paramètres de sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Paramètres de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Code PIN pour annulations</label>
                <p className="text-sm text-muted-foreground">
                  Exiger un code PIN pour annuler des transactions
                </p>
              </div>
              <Switch
                checked={securitySettings.require_pin_for_voids}
                onCheckedChange={(checked) => handleSettingChange('require_pin_for_voids', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Code PIN pour remises</label>
                <p className="text-sm text-muted-foreground">
                  Exiger un code PIN pour appliquer des remises
                </p>
              </div>
              <Switch
                checked={securitySettings.require_pin_for_discounts}
                onCheckedChange={(checked) => handleSettingChange('require_pin_for_discounts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Déconnexion automatique</label>
                <p className="text-sm text-muted-foreground">
                  Déconnexion après inactivité
                </p>
              </div>
              <Switch
                checked={securitySettings.automatic_logout}
                onCheckedChange={(checked) => handleSettingChange('automatic_logout', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Audit complet</label>
                <p className="text-sm text-muted-foreground">
                  Enregistrer toutes les actions utilisateur
                </p>
              </div>
              <Switch
                checked={securitySettings.audit_all_actions}
                onCheckedChange={(checked) => handleSettingChange('audit_all_actions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Chiffrement des transactions</label>
                <p className="text-sm text-muted-foreground">
                  Chiffrer toutes les données de transaction
                </p>
              </div>
              <Switch
                checked={securitySettings.encrypt_transactions}
                onCheckedChange={(checked) => handleSettingChange('encrypt_transactions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Timeout de session (min)</label>
                <p className="text-sm text-muted-foreground">
                  Durée avant déconnexion automatique
                </p>
              </div>
              <Input
                type="number"
                value={securitySettings.session_timeout}
                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                className="w-20"
                min="5"
                max="120"
              />
            </div>

            <div className="pt-4 border-t">
              <Button onClick={() => setShowPinDialog(true)} className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Changer le code PIN
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Journal de sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Journal de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{event.details}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog changement de PIN */}
      {showPinDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Changer le code PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code PIN actuel</label>
                <Input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength={4}
                  pattern="[0-9]*"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nouveau code PIN</label>
                <Input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={4}
                  pattern="[0-9]*"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirmer le nouveau PIN</label>
                <Input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={4}
                  pattern="[0-9]*"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPinDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button onClick={changePin} className="flex-1">
                  Confirmer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecurityControls;