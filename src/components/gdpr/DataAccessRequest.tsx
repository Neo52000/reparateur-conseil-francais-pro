import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Trash2, Edit, FileText, Shield, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DataAccessRequest = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState<'access' | 'rectify' | 'delete' | 'export' | null>(null);
  const [rectificationDetails, setRectificationDetails] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAccessRequest = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Récupérer toutes les données de l'utilisateur
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      toast({
        title: "Demande d'accès traitée",
        description: "Vos données personnelles ont été compilées. Un email vous sera envoyé avec les détails complets.",
      });

      // Log the request
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'data_access_request',
        resource_type: 'gdpr',
        resource_id: user.id,
        new_values: { request_type: 'access', timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error accessing data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande d'accès.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRequestType(null);
    }
  };

  const handleRectificationRequest = async () => {
    if (!user || !rectificationDetails.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez décrire les modifications souhaitées.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Log the rectification request
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'data_rectification_request',
        resource_type: 'gdpr',
        resource_id: user.id,
        new_values: { 
          request_type: 'rectification', 
          details: rectificationDetails,
          timestamp: new Date().toISOString() 
        }
      });

      toast({
        title: "Demande de rectification enregistrée",
        description: "Votre demande sera traitée sous 30 jours. Vous recevrez une confirmation par email.",
      });

      setRectificationDetails('');
      setRequestType(null);
    } catch (error: any) {
      console.error('Error submitting rectification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre demande de rectification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportRequest = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Export all user data
      const { data: userData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Prepare data for export
      const exportData = {
        profile: userData,
        requestDate: new Date().toISOString(),
        format: 'JSON',
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `topreparateurs-data-${user.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the export
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'data_export_request',
        resource_type: 'gdpr',
        resource_id: user.id,
        new_values: { request_type: 'export', timestamp: new Date().toISOString() }
      });

      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées au format JSON.",
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter vos données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRequestType(null);
    }
  };

  const handleDeleteRequest = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Log the deletion request
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'data_deletion_request',
        resource_type: 'gdpr',
        resource_id: user.id,
        new_values: { 
          request_type: 'deletion',
          status: 'pending_validation',
          timestamp: new Date().toISOString() 
        }
      });

      toast({
        title: "Demande de suppression enregistrée",
        description: "Votre compte sera supprimé sous 30 jours après vérification. Vous recevrez un email de confirmation.",
      });

      setShowDeleteDialog(false);
      setRequestType(null);
    } catch (error: any) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre demande de suppression.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Vous devez être connecté pour accéder à cette fonctionnalité.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Gestion de vos données personnelles</h2>
        <p className="text-muted-foreground">
          Exercez vos droits RGPD conformément au Règlement Général sur la Protection des Données
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Droit d'accès */}
        <Card className="p-6 hover:border-primary transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Droit d'accès</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Obtenez une copie de toutes les données personnelles que nous détenons à votre sujet.
              </p>
              <Button 
                onClick={() => setRequestType('access')}
                variant="outline"
                disabled={loading}
              >
                {loading && requestType === 'access' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Traitement...</>
                ) : (
                  <>Demander l'accès</>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Droit de rectification */}
        <Card className="p-6 hover:border-primary transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Edit className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Droit de rectification</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Demandez la correction de données inexactes ou incomplètes.
              </p>
              <Button 
                onClick={() => setRequestType('rectify')}
                variant="outline"
                disabled={loading}
              >
                Demander une rectification
              </Button>
            </div>
          </div>
        </Card>

        {/* Droit à la portabilité */}
        <Card className="p-6 hover:border-primary transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Droit à la portabilité</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Téléchargez vos données dans un format structuré et lisible par machine.
              </p>
              <Button 
                onClick={() => setRequestType('export')}
                variant="outline"
                disabled={loading}
              >
                {loading && requestType === 'export' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Export...</>
                ) : (
                  <>Exporter mes données</>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Droit à l'effacement */}
        <Card className="p-6 hover:border-destructive transition-colors border-destructive/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Droit à l'effacement</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Demandez la suppression définitive de votre compte et de vos données personnelles.
              </p>
              <Button 
                onClick={() => {
                  setRequestType('delete');
                  setShowDeleteDialog(true);
                }}
                variant="destructive"
                disabled={loading}
              >
                Supprimer mon compte
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Formulaire de rectification */}
      {requestType === 'rectify' && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Demande de rectification</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Décrivez les données que vous souhaitez corriger et les modifications à apporter :
          </p>
          <Textarea
            value={rectificationDetails}
            onChange={(e) => setRectificationDetails(e.target.value)}
            placeholder="Exemple : Mon adresse actuelle est incorrecte, elle devrait être..."
            className="mb-4 min-h-[120px]"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRequestType(null)}>
              Annuler
            </Button>
            <Button onClick={handleRectificationRequest} disabled={loading || !rectificationDetails.trim()}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi...</>
              ) : (
                <>Envoyer la demande</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation d'accès */}
      {requestType === 'access' && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Confirmer la demande d'accès</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vous allez recevoir un email contenant l'ensemble de vos données personnelles dans un délai de 30 jours maximum.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRequestType(null)}>
              Annuler
            </Button>
            <Button onClick={handleAccessRequest} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Traitement...</>
              ) : (
                <>Confirmer</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation d'export */}
      {requestType === 'export' && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Exporter vos données</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vos données seront téléchargées au format JSON. Ce fichier contiendra toutes vos informations personnelles.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRequestType(null)}>
              Annuler
            </Button>
            <Button onClick={handleExportRequest} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Export...</>
              ) : (
                <>Télécharger</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression du compte</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Cette action est <strong className="text-destructive">irréversible</strong>. 
                Votre compte et toutes vos données personnelles seront définitivement supprimés après un délai de 30 jours.
              </p>
              <p>
                Pendant ce délai, vous pouvez annuler votre demande en nous contactant.
              </p>
              <p className="text-sm text-muted-foreground">
                Conformément au RGPD, certaines données pourront être conservées pour des raisons légales 
                (facturation, obligations comptables).
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestType(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRequest} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Traitement...</>
              ) : (
                <>Confirmer la suppression</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Informations complémentaires */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Informations importantes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Les demandes sont traitées sous 30 jours maximum conformément au RGPD</li>
          <li>• Vous recevrez une confirmation par email pour chaque demande</li>
          <li>• En cas de doute sur l'identité du demandeur, des justificatifs pourront être demandés</li>
          <li>• Pour toute question, contactez notre DPO : <a href="mailto:dpo@topreparateurs.fr" className="text-primary hover:underline">dpo@topreparateurs.fr</a></li>
        </ul>
      </Card>
    </div>
  );
};

export default DataAccessRequest;
