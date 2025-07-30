import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Send, AlertTriangle, FileText, User, Package, Euro, Calendar } from 'lucide-react';
import { QualiReparDossier } from '@/types/qualirepar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ConfirmationStepProps {
  dossier: QualiReparDossier;
  onComplete: (data?: any) => void;
  loading: boolean;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  dossier,
  onComplete,
  loading
}) => {
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Charger les documents du dossier
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['qualirepar-documents', dossier.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qualirepar_documents')
        .select('*')
        .eq('dossier_id', dossier.id)
        .eq('upload_status', 'completed');
      
      if (error) throw error;
      return data || [];
    }
  });

  const requiredDocuments = ['FACTURE', 'BON_DEPOT', 'SERIALTAG'];
  const uploadedTypes = documents.map(doc => doc.official_document_type);
  const allRequiredUploaded = requiredDocuments.every(type => uploadedTypes.includes(type));

  const handleConfirmSubmission = async () => {
    if (!allRequiredUploaded) {
      return;
    }
    
    onComplete();
  };

  const getDocumentLabel = (type: string) => {
    const labels: Record<string, string> = {
      'FACTURE': 'Facture',
      'BON_DEPOT': 'Bon de dépôt',
      'SERIALTAG': 'Plaque signalétique',
      'PHOTO_PRODUIT': 'Photos produit',
      'JUSTIFICATIF_COMPLEMENTAIRE': 'Justificatif complémentaire'
    };
    return labels[type] || type;
  };

  if (documentsLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Vérification des documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-green-600" />
          Étape 3: Confirmation et soumission
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vérifiez tous les éléments avant de soumettre définitivement votre demande
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé du dossier */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Résumé de la demande</h3>
          
          {/* Informations client */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Nom:</span>
                  <p>{dossier.client_name}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Email:</span>
                  <p>{dossier.client_email}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Téléphone:</span>
                  <p>{dossier.client_phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Ville:</span>
                  <p>{dossier.client_city} ({dossier.client_postal_code})</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-muted-foreground">Adresse:</span>
                  <p>{dossier.client_address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations produit */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produit réparé
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Catégorie:</span>
                  <p>{dossier.product_category}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Marque:</span>
                  <p>{dossier.product_brand}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Modèle:</span>
                  <p>{dossier.product_model}</p>
                </div>
                {dossier.product_serial_number && (
                  <div>
                    <span className="font-medium text-muted-foreground">N° série:</span>
                    <p>{dossier.product_serial_number}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium text-muted-foreground">Description de la réparation:</span>
                  <p className="mt-1">{dossier.repair_description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations financières */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Informations financières
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Coût de la réparation:</span>
                  <p className="text-lg font-semibold">{dossier.repair_cost}€</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Bonus demandé:</span>
                  <p className="text-lg font-semibold text-emerald-600">{dossier.requested_bonus_amount}€</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Date de réparation:</span>
                  <p>{new Date(dossier.repair_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Éco-organisme:</span>
                  <p>{dossier.eco_organism}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Documents uploadés */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents uploadés
          </h3>
          
          <div className="grid gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium">{getDocumentLabel(doc.official_document_type)}</p>
                    <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-emerald-100 text-emerald-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Uploadé
                </Badge>
              </div>
            ))}
          </div>

          {/* Vérification des documents requis */}
          <Alert className={allRequiredUploaded ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
            {allRequiredUploaded ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={allRequiredUploaded ? "text-emerald-800" : "text-red-800"}>
              {allRequiredUploaded ? (
                "Tous les documents requis ont été uploadés avec succès"
              ) : (
                `Documents manquants: ${requiredDocuments.filter(type => !uploadedTypes.includes(type)).join(', ')}`
              )}
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* Informations de soumission */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Informations de soumission</h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">ID temporaire de demande:</span>
              <Badge variant="outline" className="bg-white">
                {dossier.temporary_claim_id}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Statut API:</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {dossier.api_status || 'En cours'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Avertissement final */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Attention :</strong> Une fois confirmée, votre demande sera envoyée définitivement au Fonds Réparation. 
            Assurez-vous que toutes les informations sont correctes car aucune modification ne sera possible.
          </AlertDescription>
        </Alert>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Retour aux documents
          </Button>
          
          <Button 
            onClick={handleConfirmSubmission}
            disabled={loading || !allRequiredUploaded}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Soumission en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirmer et soumettre
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfirmationStep;