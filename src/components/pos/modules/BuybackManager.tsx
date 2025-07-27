import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Euro, 
  Star, 
  Eye, 
  ShoppingCart,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calculator,
  FileText,
  Truck,
  Shield,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BuybackEvaluationDialog from './BuybackEvaluationDialog';
import DigitalPoliceLogbook from './DigitalPoliceLogbook';

interface BuybackDevice {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deviceBrand: string;
  deviceModel: string;
  storage: string;
  color: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  batteryHealth: number;
  screenCondition: string;
  bodyCondition: string;
  functionalIssues: string[];
  accessories: string[];
  estimatedValue: number;
  finalOffer: number;
  status: 'evaluation' | 'offered' | 'accepted' | 'rejected' | 'paid' | 'resold';
  photos: string[];
  evaluationNotes: string;
  createdAt: string;
  evaluatedAt?: string;
  acceptedAt?: string;
}

const BuybackManager: React.FC = () => {
  const { user } = useAuth();
  const [buybackDevices, setBuybackDevices] = useState<BuybackDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BuybackDevice | null>(null);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      checkAccess();
    }
  }, [user?.id]);

  const checkAccess = async () => {
    if (!user?.id) return;

    try {
      const { data: apiSettings } = await supabase
        .from('repairer_api_settings')
        .select('has_buyback_module, has_police_logbook')
        .eq('repairer_id', user.id)
        .maybeSingle();

      const hasModules = apiSettings?.has_buyback_module && apiSettings?.has_police_logbook;
      setHasAccess(hasModules || false);
      
      if (hasModules) {
        loadBuybackDevices();
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBuybackDevices = () => {
    // Simulation de données
    const mockDevices: BuybackDevice[] = [
      {
        id: 'BUY001',
        clientName: 'Sophie Laurent',
        clientPhone: '06 11 22 33 44',
        clientEmail: 'sophie.laurent@email.com',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 12',
        storage: '128GB',
        color: 'Bleu',
        condition: 'good',
        batteryHealth: 87,
        screenCondition: 'Excellent',
        bodyCondition: 'Quelques rayures mineures',
        functionalIssues: [],
        accessories: ['Chargeur', 'Écouteurs'],
        estimatedValue: 420,
        finalOffer: 400,
        status: 'offered',
        photos: [],
        evaluationNotes: 'Bon état général, batterie correcte',
        createdAt: '2024-07-25',
        evaluatedAt: '2024-07-25'
      }
    ];
    setBuybackDevices(mockDevices);
  };

  const getStatusBadge = (status: BuybackDevice['status']) => {
    const statusConfig = {
      evaluation: { label: 'Évaluation', variant: 'outline' as const, color: 'text-blue-600' },
      offered: { label: 'Offre proposée', variant: 'outline' as const, color: 'text-yellow-600' },
      accepted: { label: 'Acceptée', variant: 'default' as const, color: 'text-green-600' },
      rejected: { label: 'Refusée', variant: 'outline' as const, color: 'text-red-600' },
      paid: { label: 'Payée', variant: 'default' as const, color: 'text-green-600' },
      resold: { label: 'Revendue', variant: 'outline' as const, color: 'text-purple-600' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleEvaluationComplete = (evaluationData: any) => {
    const newDevice: BuybackDevice = {
      id: `BUY${String(buybackDevices.length + 1).padStart(3, '0')}`,
      clientName: evaluationData.clientName,
      clientPhone: evaluationData.clientPhone,
      clientEmail: evaluationData.clientEmail,
      deviceBrand: evaluationData.deviceBrand,
      deviceModel: evaluationData.deviceModel,
      storage: evaluationData.storage,
      color: evaluationData.color,
      condition: evaluationData.screenCondition === 'parfait' ? 'excellent' : 'good',
      batteryHealth: evaluationData.batteryHealth,
      screenCondition: evaluationData.screenCondition,
      bodyCondition: evaluationData.bodyCondition,
      functionalIssues: evaluationData.functionalIssues,
      accessories: [],
      estimatedValue: 450,
      finalOffer: 0,
      status: 'evaluation',
      photos: [],
      evaluationNotes: evaluationData.evaluationNotes,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setBuybackDevices(prev => [...prev, newDevice]);
    toast({
      title: "Évaluation créée",
      description: `Nouveau rachat ${newDevice.id} créé avec succès`
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Module de rachat non activé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Pour utiliser le module de rachat, vous devez d'abord l'activer dans vos paramètres :
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Activer le module de rachat</li>
            <li>Activer le livre de police dématérialisé (obligatoire)</li>
            <li>Configurer vos clés API (Stripe pour les paiements, Resend pour les emails)</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Conformité légale</p>
                <p>Le rachat d'objets d'occasion nécessite un livre de police dématérialisé conforme à la réglementation française.</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => window.open('/settings', '_blank')} 
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configurer les paramètres
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="rachats" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="rachats">Gestion des rachats</TabsTrigger>
        <TabsTrigger value="police-logbook" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Livre de police
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="rachats" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <Eye className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">En évaluation</p>
                <p className="text-2xl font-bold">{buybackDevices.filter(d => d.status === 'evaluation').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Rachat d'Appareils
              <Button onClick={() => setIsEvaluationDialogOpen(true)}>
                <Smartphone className="w-4 h-4 mr-2" />
                Commencer l'évaluation
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Appareil</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buybackDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.id}</TableCell>
                    <TableCell>{device.clientName}</TableCell>
                    <TableCell>{device.deviceBrand} {device.deviceModel}</TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="police-logbook">
        <DigitalPoliceLogbook repairerId={user?.id || ''} hasAccess={hasAccess} />
      </TabsContent>

      <BuybackEvaluationDialog
        open={isEvaluationDialogOpen}
        onOpenChange={setIsEvaluationDialogOpen}
        onComplete={handleEvaluationComplete}
      />
    </Tabs>
  );
};

export default BuybackManager;