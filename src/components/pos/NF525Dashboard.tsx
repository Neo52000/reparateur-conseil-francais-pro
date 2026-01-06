import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  Download,
  RefreshCw,
  Archive,
  Link2,
  Lock,
  Calendar,
  Hash
} from 'lucide-react';
import { nf525ComplianceService } from '@/services/pos/nf525ComplianceService';
import ReceiptArchiveManager from './ReceiptArchiveManager';

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  weight: number;
}

interface NF525DashboardProps {
  repairerId: string;
}

const NF525Dashboard: React.FC<NF525DashboardProps> = ({ repairerId }) => {
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [status, setStatus] = useState<'compliant' | 'partial' | 'non-compliant'>('partial');
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  
  const { toast } = useToast();

  const runChecks = async () => {
    setLoading(true);
    try {
      const result = await nf525ComplianceService.runComplianceChecks(repairerId);
      setChecks(result.checks);
      setOverallScore(result.overallScore);
      setStatus(result.status);
      setLastCheck(new Date().toLocaleString('fr-FR'));
      
      toast({
        title: "Vérification terminée",
        description: `Score de conformité: ${result.overallScore}%`
      });
    } catch (error) {
      console.error('Erreur vérification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier la conformité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const { reportHtml } = await nf525ComplianceService.generateComplianceReport(repairerId);
      
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-nf525-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Rapport téléchargé",
        description: "Le rapport de conformité a été généré"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    runChecks();
  }, [repairerId]);

  const getStatusIcon = (checkStatus: string) => {
    switch (checkStatus) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Conforme</Badge>;
      case 'partial':
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1" />Partiellement conforme</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Non conforme</Badge>;
    }
  };

  const getScoreColor = () => {
    if (overallScore >= 90) return 'text-green-600';
    if (overallScore >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            Conformité NF-525
          </h2>
          <p className="text-muted-foreground">
            Tableau de bord de conformité pour votre système de caisse
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Rapport PDF
          </Button>
          <Button onClick={runChecks} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vérifier
          </Button>
        </div>
      </div>

      {/* Score principal */}
      <Card className="border-2 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor()}`}>
                  {overallScore}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Score global</p>
              </div>
              <div className="border-l pl-6">
                {getStatusBadge()}
                <p className="text-sm text-muted-foreground mt-2">
                  {lastCheck && `Dernière vérification: ${lastCheck}`}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-2">
                  <Archive className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">Archivage</p>
                <p className="text-xs text-muted-foreground">Automatique</p>
              </div>
              <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-2">
                  <Link2 className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Chaînage</p>
                <p className="text-xs text-muted-foreground">SHA-256</p>
              </div>
              <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mx-auto mb-2">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Conservation</p>
                <p className="text-xs text-muted-foreground">10 ans</p>
              </div>
            </div>
          </div>
          
          <Progress value={overallScore} className="mt-6 h-3" />
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue="checks">
        <TabsList>
          <TabsTrigger value="checks">Vérifications</TabsTrigger>
          <TabsTrigger value="archives">Archives</TabsTrigger>
          <TabsTrigger value="info">Informations NF-525</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Détail des vérifications</CardTitle>
              <CardDescription>
                Chaque point est vérifié pour garantir la conformité NF-525
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checks.map((check) => (
                  <div 
                    key={check.id}
                    className={`p-4 rounded-lg border ${
                      check.status === 'pass' ? 'border-green-200 bg-green-50' :
                      check.status === 'warning' ? 'border-amber-200 bg-amber-50' :
                      'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <h4 className="font-medium">{check.name}</h4>
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                          <p className="text-xs mt-1 opacity-75">{check.details}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Poids: {check.weight}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archives" className="mt-4">
          <ReceiptArchiveManager repairerId={repairerId} />
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Qu'est-ce que la NF-525 ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La norme NF-525 est une certification française obligatoire depuis le 1er janvier 2018 
                  pour tous les logiciels de caisse. Elle garantit :
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Inaltérabilité</strong> - Les données ne peuvent pas être modifiées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Sécurisation</strong> - Chaînage cryptographique des tickets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Conservation</strong> - Archivage pendant 10 ans minimum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Archivage</strong> - Export et consultation à tout moment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Comment ça fonctionne ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Génération du ticket</p>
                      <p className="text-sm text-muted-foreground">
                        Chaque transaction génère un ticket avec toutes les informations requises
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Hash SHA-256</p>
                      <p className="text-sm text-muted-foreground">
                        Un hash unique est calculé et lié au ticket précédent
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Archivage sécurisé</p>
                      <p className="text-sm text-muted-foreground">
                        Le ticket est archivé de manière inaltérable pour 10 ans
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Obligations légales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-medium mb-2">En cas de contrôle fiscal</h4>
                    <p className="text-sm text-muted-foreground">
                      Vous devez pouvoir présenter une attestation de conformité et 
                      l'ensemble des archives de vos tickets de caisse.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-medium mb-2">Sanctions en cas de non-conformité</h4>
                    <p className="text-sm text-muted-foreground">
                      Amende de 7 500€ par logiciel non conforme utilisé. 
                      Cette amende peut être appliquée à chaque contrôle.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-medium mb-2">Votre protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Ce système de caisse est conforme NF-525. Conservez votre 
                      attestation et vos rapports de conformité.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NF525Dashboard;
