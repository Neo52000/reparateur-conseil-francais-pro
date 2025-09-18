import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  Settings,
  Send,
  CheckCircle,
  AlertCircle,
  Download,
  Plus,
  Eye,
  Bell,
  Clock,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ElectronicInvoiceService, type ElectronicInvoice, type LegalInfo } from "@/services/electronicInvoiceService";
import { InvoiceAutomationService } from "@/services/invoiceAutomationService";
import { useAuth } from "@/hooks/useAuth";

const ElectronicBillingSection: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<ElectronicInvoice[]>([]);
  const [legalInfo, setLegalInfo] = useState<LegalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLegalForm, setShowLegalForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [pendingQuotes, setPendingQuotes] = useState<any[]>([]);
  const [automationStats, setAutomationStats] = useState({
    auto_generated: 0,
    pending_chorus_pro: 0,
    overdue_invoices: 0
  });

  // Form states
  const [legalFormData, setLegalFormData] = useState<LegalInfo>({
    siret: '',
    tva_number: '',
    naf_code: '',
    legal_form: '',
    capital_social: 0,
    rcs_number: '',
    rcs_city: '',
    invoice_prefix: 'FACT',
    legal_mentions: '',
    payment_terms_days: 30,
    late_penalty_rate: 3.0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Charger les informations légales
      const legal = await ElectronicInvoiceService.getLegalInfo(user.id);
      setLegalInfo(legal);
      if (legal) {
        setLegalFormData(legal);
      }

      // Charger les factures
      const invoiceList = await ElectronicInvoiceService.getInvoicesByRepairer(user.id);
      setInvoices(invoiceList);

      // Charger les devis en attente de facturation
      await loadPendingQuotes();
      
      // Calculer les statistiques d'automatisation
      await loadAutomationStats();
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingQuotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select(`
          *,
          profiles!quotes_with_timeline_client_id_fkey (
            first_name, last_name, email, siret_number
          )
        `)
        .eq('repairer_id', user.id)
        .eq('status', 'accepted')
        .is('electronic_invoices.quote_id', null);

      if (!error && data) {
        setPendingQuotes(data);
      }
    } catch (error) {
      console.error('Erreur chargement devis en attente:', error);
    }
  };

  const loadAutomationStats = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const overdueDate = new Date();
      overdueDate.setDate(today.getDate() - 30);

      const [invoicesData] = await Promise.all([
        supabase
          .from('electronic_invoices')
          .select('status, chorus_pro_status, due_date, created_at')
          .eq('repairer_id', user.id)
      ]);

      if (invoicesData.data) {
        const stats = {
          auto_generated: invoicesData.data.filter(i => 
            i.created_at && new Date(i.created_at) > overdueDate
          ).length,
          pending_chorus_pro: invoicesData.data.filter(i => 
            i.status === 'ready_for_chorus_pro'
          ).length,
          overdue_invoices: invoicesData.data.filter(i => 
            i.due_date && new Date(i.due_date) < today && i.status !== 'paid'
          ).length
        };
        setAutomationStats(stats);
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  const handleSaveLegalInfo = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const success = await ElectronicInvoiceService.updateLegalInfo(user.id, legalFormData);
      if (success) {
        toast.success('Informations légales sauvegardées');
        setLegalInfo(legalFormData);
        setShowLegalForm(false);
      } else {
        throw new Error('Erreur sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFacturX = async (invoiceId: string) => {
    try {
      toast.info('Génération du Factur-X en cours...');
      const result = await ElectronicInvoiceService.generateFacturX(invoiceId);
      toast.success('Factur-X généré avec succès');
      
      // Télécharger le PDF
      window.open(result.pdf_url, '_blank');
      
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de la génération Factur-X');
    }
  };

  const handleSubmitChorusPro = async (invoiceId: string) => {
    try {
      toast.info('Soumission à Chorus Pro en cours...');
      const success = await ElectronicInvoiceService.submitToChorusPro(invoiceId);
      
      if (success) {
        toast.success('Facture soumise à Chorus Pro');
        await loadData();
      } else {
        toast.error('Erreur lors de la soumission à Chorus Pro');
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission à Chorus Pro');
    }
  };

  const handleAutoGenerateFromQuote = async (quoteId: string) => {
    setLoading(true);
    try {
      const success = await InvoiceAutomationService.autoGenerateFromQuote(quoteId);
      
      if (success) {
        toast.success('Facture générée automatiquement depuis le devis');
        await loadData();
      } else {
        toast.error('Erreur lors de la génération automatique');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération automatique');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      sent: { label: 'Envoyée', variant: 'default' as const },
      validated: { label: 'Validée', variant: 'default' as const },
      paid: { label: 'Payée', variant: 'default' as const },
      cancelled: { label: 'Annulée', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getChorusProBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      submitted: { label: 'Soumise', variant: 'secondary' as const },
      accepted: { label: 'Acceptée', variant: 'default' as const },
      rejected: { label: 'Rejetée', variant: 'destructive' as const },
      processed: { label: 'Traitée', variant: 'default' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return <Badge variant={config.variant}>Chorus Pro: {config.label}</Badge>;
  };

  if (!legalInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Facturation électronique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configuration requise</h3>
            <p className="text-muted-foreground mb-6">
              Configurez vos informations légales pour utiliser la facturation électronique conforme.
            </p>
            <Button onClick={() => setShowLegalForm(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurer mes informations légales
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Mes factures</TabsTrigger>
          <TabsTrigger value="automation">Automatisation</TabsTrigger>
          <TabsTrigger value="pending">Devis en attente</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          {/* En-tête avec actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Facturation électronique conforme 2026
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLegalForm(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuration
                  </Button>
                  <Button size="sm" onClick={() => setShowInvoiceForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle facture
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {invoices.filter(i => i.status === 'paid').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Factures payées</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-secondary">
                    {automationStats.pending_chorus_pro}
                  </div>
                  <div className="text-sm text-muted-foreground">En attente Chorus Pro</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {invoices.reduce((sum, i) => sum + i.amount_ttc, 0).toFixed(2)} €
                  </div>
                  <div className="text-sm text-muted-foreground">CA total</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {automationStats.overdue_invoices}
                  </div>
                  <div className="text-sm text-muted-foreground">En retard</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des factures */}
          <Card>
            <CardHeader>
              <CardTitle>Mes factures électroniques</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Chorus Pro</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{invoice.amount_ttc.toFixed(2)} €</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{getChorusProBadge(invoice.chorus_pro_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateFacturX(invoice.id)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          {invoice.status === 'sent' && !invoice.chorus_pro_status && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSubmitChorusPro(invoice.id)}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Automatisation et rappels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <Badge variant="secondary">{automationStats.auto_generated}</Badge>
                  </div>
                  <h3 className="font-semibold mt-2">Factures auto-générées</h3>
                  <p className="text-sm text-muted-foreground">
                    Depuis les devis acceptés ce mois
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Send className="h-8 w-8 text-amber-600" />
                    <Badge variant="outline">{automationStats.pending_chorus_pro}</Badge>
                  </div>
                  <h3 className="font-semibold mt-2">En attente Chorus Pro</h3>
                  <p className="text-sm text-muted-foreground">
                    Factures B2B à soumettre
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <Badge variant="destructive">{automationStats.overdue_invoices}</Badge>
                  </div>
                  <h3 className="font-semibold mt-2">Factures en retard</h3>
                  <p className="text-sm text-muted-foreground">
                    Nécessitent un suivi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Devis acceptés en attente de facturation</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingQuotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun devis en attente de facturation
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Appareil</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date acceptation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell>
                          {quote.profiles?.first_name} {quote.profiles?.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={quote.profiles?.siret_number ? 'default' : 'secondary'}>
                            {quote.profiles?.siret_number ? 'B2B' : 'B2C'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {quote.device_brand} {quote.device_model}
                        </TableCell>
                        <TableCell>{quote.estimated_price?.toFixed(2)} €</TableCell>
                        <TableCell>
                          {new Date(quote.updated_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAutoGenerateFromQuote(quote.id)}
                            disabled={loading}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Générer facture
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Rapports de conformité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Conformité 2026</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Votre système de facturation est conforme aux exigences 2026
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Factures Factur-X</h4>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {invoices.filter(i => i.status !== 'draft').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Format électronique</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Soumissions Chorus Pro</h4>
                    <p className="text-2xl font-bold text-secondary mt-2">
                      {invoices.filter(i => i.chorus_pro_status).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Secteur public</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog configuration légale */}
      <Dialog open={showLegalForm} onOpenChange={setShowLegalForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuration légale</DialogTitle>
            <DialogDescription>
              Configurez vos informations légales pour la facturation électronique.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siret">SIRET *</Label>
                <Input
                  id="siret"
                  value={legalFormData.siret}
                  onChange={(e) => setLegalFormData(prev => ({ ...prev, siret: e.target.value }))}
                  placeholder="12345678901234"
                />
              </div>
              <div>
                <Label htmlFor="tva_number">N° TVA Intracommunautaire</Label>
                <Input
                  id="tva_number"
                  value={legalFormData.tva_number || ''}
                  onChange={(e) => setLegalFormData(prev => ({ ...prev, tva_number: e.target.value }))}
                  placeholder="FR12345678901"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="naf_code">Code NAF</Label>
                <Input
                  id="naf_code"
                  value={legalFormData.naf_code || ''}
                  onChange={(e) => setLegalFormData(prev => ({ ...prev, naf_code: e.target.value }))}
                  placeholder="9521Z"
                />
              </div>
              <div>
                <Label htmlFor="legal_form">Forme juridique</Label>
                <Input
                  id="legal_form"
                  value={legalFormData.legal_form || ''}
                  onChange={(e) => setLegalFormData(prev => ({ ...prev, legal_form: e.target.value }))}
                  placeholder="SARL, SAS, EI..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="legal_mentions">Mentions légales</Label>
              <Textarea
                id="legal_mentions"
                value={legalFormData.legal_mentions || ''}
                onChange={(e) => setLegalFormData(prev => ({ ...prev, legal_mentions: e.target.value }))}
                placeholder="Mentions légales obligatoires..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLegalForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveLegalInfo} disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ElectronicBillingSection;