import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Send, Eye, FileText, Mail } from 'lucide-react';
import type { ElectronicInvoice } from '@/services/electronicInvoiceService';

interface InvoiceTableProps {
  invoices: ElectronicInvoice[];
  onGenerateFacturX: (invoiceId: string) => void;
  onSubmitChorusPro: (invoiceId: string) => void;
  onSendByEmail: (invoiceId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onGenerateFacturX,
  onSubmitChorusPro,
  onSendByEmail,
  onViewInvoice
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      sent: { label: 'Envoyée', variant: 'default' as const },
      validated: { label: 'Validée', variant: 'default' as const },
      paid: { label: 'Payée', variant: 'default' as const },
      overdue: { label: 'En retard', variant: 'destructive' as const },
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

    return <Badge variant={config.variant} className="ml-2">CP: {config.label}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Montant TTC</TableHead>
            <TableHead>Échéance</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Aucune facture disponible
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>
                  {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{invoice.client_name}</p>
                    {invoice.client_siret && (
                      <p className="text-muted-foreground text-xs">SIRET: {invoice.client_siret}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {invoice.amount_ttc.toFixed(2)} €
                </TableCell>
                <TableCell>
                  {invoice.due_date && new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusBadge(invoice.status)}
                    {getChorusProBadge(invoice.chorus_pro_status)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewInvoice(invoice.id)}
                      title="Voir la facture"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onGenerateFacturX(invoice.id)}
                      title="Télécharger PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSendByEmail(invoice.id)}
                      title="Envoyer par email"
                      disabled={invoice.status === 'draft'}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    {invoice.status === 'sent' && !invoice.chorus_pro_status && invoice.client_siret && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSubmitChorusPro(invoice.id)}
                        title="Soumettre à Chorus Pro"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
