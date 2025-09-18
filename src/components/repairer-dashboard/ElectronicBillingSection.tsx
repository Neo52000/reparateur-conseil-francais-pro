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
  Eye
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
import { ElectronicInvoiceService, type ElectronicInvoice, type LegalInfo } from "@/services/electronicInvoiceService";
import { useAuth } from "@/hooks/useAuth";

const ElectronicBillingSection: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<ElectronicInvoice[]>([]);
  const [legalInfo, setLegalInfo] = useState<LegalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLegalForm, setShowLegalForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

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
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {invoices.filter(i => i.status === 'paid').length}
              </div>
              <div className="text-sm text-muted-foreground">Factures payées</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {invoices.filter(i => i.chorus_pro_status === 'submitted').length}
              </div>
              <div className="text-sm text-muted-foreground">Chorus Pro</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {invoices.reduce((sum, i) => sum + i.amount_ttc, 0).toFixed(2)} €
              </div>
              <div className="text-sm text-muted-foreground">CA total</div>
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