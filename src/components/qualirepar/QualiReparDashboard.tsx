import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQualiReparSubmission } from '@/hooks/useQualiReparSubmission';
import { useQualiReparDossiers } from '@/hooks/useQualiReparDossiers';
import { QualiReparDossier } from '@/types/qualirepar';
import QualiReparCreateForm from './QualiReparCreateForm';
import QualiReparDocumentManager from './QualiReparDocumentManager';
import { 
  Recycle, 
  Plus, 
  Eye, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  Euro,
  FileText,
  TrendingUp,
  Upload,
  Calendar,
  Filter
} from 'lucide-react';

const QualiReparDashboard: React.FC = () => {
  const { dossiers, loading, getDossierStats } = useQualiReparDossiers();
  const { submitDossier, submitting } = useQualiReparSubmission();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<QualiReparDossier | null>(null);
  
  if (loading) {
    return <div className="animate-pulse">Chargement...</div>;
  }

  const stats = getDossierStats();
  
  const getStatusIcon = (status: QualiReparDossier['status']) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'ready_to_submit': return <Send className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'paid': return <Euro className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: QualiReparDossier['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'ready_to_submit': return 'default';
      case 'submitted': return 'default';
      case 'processing': return 'default';
      case 'approved': return 'default';
      case 'paid': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: QualiReparDossier['status']) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'ready_to_submit': return 'Prêt à envoyer';
      case 'submitted': return 'Envoyé';
      case 'processing': return 'En traitement';
      case 'approved': return 'Approuvé';
      case 'paid': return 'Payé';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  };

  const filteredDossiers = selectedStatus === 'all' 
    ? dossiers 
    : dossiers.filter(d => d.status === selectedStatus);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Recycle className="h-6 w-6 text-emerald-600" />
            Bonus QualiRépar
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos demandes de bonus pour les réparations éligibles
          </p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau dossier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-emerald-600" />
                Créer un nouveau dossier QualiRépar
              </DialogTitle>
            </DialogHeader>
            <QualiReparCreateForm
              onDossierCreated={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total dossiers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold">{stats.submitted}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payés</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total remboursé</p>
                <p className="text-2xl font-bold">{stats.totalApproved}€</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('all')}
        >
          Tous ({stats.total})
        </Button>
        <Button 
          variant={selectedStatus === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('draft')}
        >
          Brouillons ({stats.draft})
        </Button>
        <Button 
          variant={selectedStatus === 'submitted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('submitted')}
        >
          Envoyés ({stats.submitted})
        </Button>
        <Button 
          variant={selectedStatus === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('paid')}
        >
          Payés ({stats.paid})
        </Button>
      </div>

      {/* Liste des dossiers */}
      <div className="space-y-4">
        {filteredDossiers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Recycle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun dossier QualiRépar
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre premier dossier de demande de bonus
              </p>
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer mon premier dossier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Recycle className="h-5 w-5 text-emerald-600" />
                      Créer votre premier dossier QualiRépar
                    </DialogTitle>
                  </DialogHeader>
                  <QualiReparCreateForm
                    onDossierCreated={() => setShowCreateForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          filteredDossiers.map((dossier) => (
            <Card key={dossier.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {dossier.dossier_number}
                      </h3>
                      <Badge variant={getStatusColor(dossier.status)}>
                        {getStatusIcon(dossier.status)}
                        <span className="ml-1">{getStatusLabel(dossier.status)}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Client:</span> {dossier.client_first_name} {dossier.client_last_name}
                      </div>
                      <div>
                        <span className="font-medium">Produit:</span> {dossier.product_brand} {dossier.product_model}
                      </div>
                      <div>
                        <span className="font-medium">Montant:</span> {dossier.requested_bonus_amount}€
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(dossier.repair_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Dossier {dossier.dossier_number}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Informations générales */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Informations générales</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Client:</span> {dossier.client_first_name} {dossier.client_last_name}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span> {dossier.client_email}
                                </div>
                                <div>
                                  <span className="font-medium">Produit:</span> {dossier.product_brand} {dossier.product_model}
                                </div>
                                <div>
                                  <span className="font-medium">Montant:</span> {dossier.requested_bonus_amount}€
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span> {new Date(dossier.repair_date).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Statut:</span>
                                  <Badge variant={getStatusColor(dossier.status)} className="ml-2">
                                    {getStatusLabel(dossier.status)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <span className="font-medium">Description:</span>
                                <p className="text-sm text-gray-600 mt-1">{dossier.repair_description}</p>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Documents */}
                          <QualiReparDocumentManager dossierId={dossier.id} />
                          
                          {/* Actions */}
                          <div className="flex justify-end gap-3">
                            {dossier.status === 'draft' && (
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => submitDossier(dossier.id)}
                                disabled={submitting}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {submitting ? 'Envoi...' : 'Envoyer le dossier'}
                              </Button>
                            )}
                            <Button variant="outline">
                              <FileText className="h-4 w-4 mr-2" />
                              Générer PDF
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Documents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default QualiReparDashboard;