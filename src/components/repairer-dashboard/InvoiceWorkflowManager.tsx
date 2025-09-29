import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowRight,
  FileText,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceAutomationService } from "@/services/invoiceAutomationService";
import { ElectronicInvoiceService } from "@/services/electronicInvoiceService";
import ClientTypeSelector from "./ClientTypeSelector";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  action?: () => Promise<void>;
}

interface InvoiceWorkflowManagerProps {
  quoteId?: string;
  invoiceId?: string;
  onWorkflowComplete?: () => void;
}

const InvoiceWorkflowManager: React.FC<InvoiceWorkflowManagerProps> = ({
  quoteId,
  invoiceId,
  onWorkflowComplete
}) => {
  const [quote, setQuote] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [clientType, setClientType] = useState<'B2B' | 'B2C'>('B2C');
  const [loading, setLoading] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

  useEffect(() => {
    if (quoteId) {
      loadQuoteData();
    }
    if (invoiceId) {
      loadInvoiceData();
    }
  }, [quoteId, invoiceId]);

  useEffect(() => {
    updateWorkflowSteps();
  }, [quote, invoice, clientType]);

  const loadQuoteData = async () => {
    if (!quoteId) return;

    try {
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select(`
          *,
          profiles!quotes_with_timeline_client_id_fkey (
            first_name, last_name, email, siret_number, company_name
          )
        `)
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      setQuote(data);
      
      // Déterminer le type de client via legal info
      const { data: legalInfo } = await supabase
        .from('repairer_legal_info')
        .select('siret')
        .eq('repairer_id', data.client_id)
        .single();
      
      const type = legalInfo?.siret ? 'B2B' : 'B2C';
      setClientType(type);
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      toast.error('Erreur lors du chargement du devis');
    }
  };

  const loadInvoiceData = async () => {
    if (!invoiceId) return;

    try {
      const { data, error } = await supabase
        .from('electronic_invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      setInvoice(data);
    } catch (error) {
      console.error('Erreur chargement facture:', error);
      toast.error('Erreur lors du chargement de la facture');
    }
  };

  const updateWorkflowSteps = () => {
    const steps: WorkflowStep[] = [];

    if (quoteId && !invoice) {
      steps.push({
        id: 'generate_invoice',
        title: 'Générer la facture électronique',
        description: 'Créer une facture conforme depuis le devis accepté',
        status: 'pending',
        action: handleGenerateInvoice
      });
    }

    if (invoice) {
      steps.push(
        {
          id: 'invoice_generated',
          title: 'Facture générée',
          description: `Facture ${invoice.invoice_number} créée avec succès`,
          status: 'completed'
        },
        {
          id: 'generate_factur_x',
          title: 'Générer Factur-X',
          description: 'Format PDF + XML UBL conforme',
          status: invoice.status === 'draft' ? 'pending' : 'completed',
          action: invoice.status === 'draft' ? handleGenerateFacturX : undefined
        }
      );

      if (clientType === 'B2B') {
        steps.push({
          id: 'submit_chorus_pro',
          title: 'Soumettre à Chorus Pro',
          description: 'Transmission obligatoire secteur public',
          status: invoice.chorus_pro_status ? 'completed' : 'pending',
          action: !invoice.chorus_pro_status ? handleSubmitChorusPro : undefined
        });
      }

      steps.push({
        id: 'send_to_client',
        title: 'Envoyer au client',
        description: clientType === 'B2B' ? 'Notification client entreprise' : 'Envoi particulier',
        status: invoice.status === 'sent' ? 'completed' : 'pending',
        action: invoice.status !== 'sent' ? handleSendToClient : undefined
      });
    }

    setWorkflowSteps(steps);
  };

  const handleGenerateInvoice = async () => {
    if (!quoteId) return;

    setLoading(true);
    try {
      const success = await InvoiceAutomationService.autoGenerateFromQuote(quoteId);
      
      if (success) {
        toast.success('Facture générée avec succès');
        await loadInvoiceData();
        onWorkflowComplete?.();
      } else {
        throw new Error('Échec génération facture');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFacturX = async () => {
    if (!invoice) return;

    setLoading(true);
    try {
      await ElectronicInvoiceService.generateFacturX(invoice.id);
      toast.success('Factur-X généré avec succès');
      await loadInvoiceData();
    } catch (error) {
      toast.error('Erreur génération Factur-X');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChorusPro = async () => {
    if (!invoice) return;

    setLoading(true);
    try {
      const success = await ElectronicInvoiceService.submitToChorusPro(invoice.id);
      
      if (success) {
        toast.success('Soumission Chorus Pro réussie');
        await loadInvoiceData();
      } else {
        throw new Error('Échec soumission Chorus Pro');
      }
    } catch (error) {
      toast.error('Erreur soumission Chorus Pro');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToClient = async () => {
    if (!invoice) return;

    setLoading(true);
    try {
      // Simuler l'envoi au client
      await supabase
        .from('electronic_invoices')
        .update({ 
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id);

      toast.success('Facture envoyée au client');
      await loadInvoiceData();
    } catch (error) {
      toast.error('Erreur envoi facture');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (!quote && !invoice) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Sélectionnez un devis ou une facture pour voir le workflow
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations client */}
      {quote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {clientType === 'B2B' ? (
                <Building className="h-5 w-5 mr-2 text-blue-600" />
              ) : (
                <User className="h-5 w-5 mr-2 text-green-600" />
              )}
              Client {clientType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Nom:</strong> {quote.profiles?.first_name} {quote.profiles?.last_name}
              </div>
              <div>
                <strong>Email:</strong> {quote.profiles?.email}
              </div>
              {quote.profiles?.company_name && (
                <div>
                  <strong>Entreprise:</strong> {quote.profiles?.company_name}
                </div>
              )}
              {quote.profiles?.siret_number && (
                <div>
                  <strong>SIRET:</strong> {quote.profiles?.siret_number}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow de facturation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Workflow de facturation électronique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getStepIcon(step.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    
                    {step.action && step.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={step.action}
                        disabled={loading}
                      >
                        Exécuter
                      </Button>
                    )}
                  </div>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes conformité */}
      {clientType === 'B2B' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">
                  Facturation B2B - Obligations légales
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  Cette facture doit être soumise à Chorus Pro conformément à la 
                  réglementation française sur la facturation électronique.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceWorkflowManager;