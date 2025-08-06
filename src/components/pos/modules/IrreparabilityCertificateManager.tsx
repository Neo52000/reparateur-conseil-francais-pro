import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileX, Download, Eye, Plus, Calendar, User, Smartphone, FileText, Shield } from 'lucide-react';

interface IrrepCertificate {
  id: string;
  certificate_number: string;
  client_name: string;
  device_brand: string;
  device_model: string;
  diagnostic_date: string;
  certificate_status: string;
  pdf_url?: string;
  created_at: string;
}

interface DiagnosticComponent {
  id?: string;
  component_name: string;
  component_state: string;
  failure_description: string;
  repair_feasibility: string;
  spare_parts_availability?: string;
  estimated_repair_time?: number;
}

const IrreparabilityCertificateManager: React.FC = () => {
  const [certificates, setCertificates] = useState<IrrepCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<IrrepCertificate | null>(null);
  const [diagnosticComponents, setDiagnosticComponents] = useState<DiagnosticComponent[]>([]);
  const { toast } = useToast();

  // Form data for new certificate
  const [formData, setFormData] = useState({
    client_name: '',
    client_address: '',
    client_phone: '',
    client_email: '',
    device_brand: '',
    device_model: '',
    device_serial_number: '',
    device_imei: '',
    purchase_date: '',
    purchase_price: '',
    purchase_store: '',
    warranty_status: 'expired',
    diagnostic_description: '',
    technical_analysis: '',
    repair_impossibility_reason: '',
    estimated_repair_cost: '',
    replacement_value: '',
    insurance_claim_number: ''
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('irreparability_certificates')
        .select('*')
        .eq('repairer_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les certificats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCertificate = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utilisateur non connecté');

      const certificateData: any = {
        ...formData,
        repairer_id: user.user.id,
        technician_id: user.user.id,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        estimated_repair_cost: formData.estimated_repair_cost ? parseFloat(formData.estimated_repair_cost) : null,
        replacement_value: formData.replacement_value ? parseFloat(formData.replacement_value) : null,
        certificate_status: 'draft'
      };

      // Le certificate_number sera généré automatiquement par le trigger
      delete certificateData.certificate_number;

      const { data, error } = await supabase
        .from('irreparability_certificates')
        .insert(certificateData)
        .select()
        .single();

      if (error) throw error;

      // Ajouter les composants de diagnostic
      if (diagnosticComponents.length > 0) {
        const diagnosticsData = diagnosticComponents.map(comp => ({
          certificate_id: data.id,
          ...comp
        }));

        const { error: diagError } = await supabase
          .from('irreparability_diagnostics')
          .insert(diagnosticsData);

        if (diagError) throw diagError;
      }

      toast({
        title: "Certificat créé",
        description: `Certificat ${data.certificate_number} créé avec succès`
      });

      setShowCreateModal(false);
      resetForm();
      loadCertificates();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le certificat",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async (certificate: IrrepCertificate) => {
    try {
      // Appeler la fonction d'archivage NF525
      const { data, error } = await supabase.rpc('auto_archive_certificate', {
        certificate_id: certificate.id
      });

      if (error) throw error;

      toast({
        title: "PDF généré",
        description: "Le certificat PDF a été généré et archivé conformément à la NF525",
        variant: "default"
      });

      loadCertificates();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_address: '',
      client_phone: '',
      client_email: '',
      device_brand: '',
      device_model: '',
      device_serial_number: '',
      device_imei: '',
      purchase_date: '',
      purchase_price: '',
      purchase_store: '',
      warranty_status: 'expired',
      diagnostic_description: '',
      technical_analysis: '',
      repair_impossibility_reason: '',
      estimated_repair_cost: '',
      replacement_value: '',
      insurance_claim_number: ''
    });
    setDiagnosticComponents([]);
  };

  const addDiagnosticComponent = () => {
    setDiagnosticComponents([...diagnosticComponents, {
      component_name: '',
      component_state: '',
      failure_description: '',
      repair_feasibility: 'impossible'
    }]);
  };

  const updateDiagnosticComponent = (index: number, field: string, value: string | number) => {
    const updated = [...diagnosticComponents];
    updated[index] = { ...updated[index], [field]: value };
    setDiagnosticComponents(updated);
  };

  const removeDiagnosticComponent = (index: number) => {
    setDiagnosticComponents(diagnosticComponents.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, label: "Brouillon" },
      completed: { variant: "default" as const, label: "Terminé" },
      archived: { variant: "outline" as const, label: "Archivé" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des certificats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5" />
            Certificats d'irréparabilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              Génération de certificats conformes au Code de la consommation
            </p>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau certificat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouveau certificat d'irréparabilité</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="client" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="client">Client</TabsTrigger>
                    <TabsTrigger value="device">Appareil</TabsTrigger>
                    <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
                    <TabsTrigger value="conclusion">Conclusion</TabsTrigger>
                  </TabsList>

                  <TabsContent value="client" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_name">Nom du client *</Label>
                        <Input
                          id="client_name"
                          value={formData.client_name}
                          onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                          placeholder="Nom complet du client"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client_phone">Téléphone</Label>
                        <Input
                          id="client_phone"
                          value={formData.client_phone}
                          onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client_email">Email</Label>
                        <Input
                          id="client_email"
                          type="email"
                          value={formData.client_email}
                          onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                          placeholder="client@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="insurance_claim_number">N° sinistre assurance</Label>
                        <Input
                          id="insurance_claim_number"
                          value={formData.insurance_claim_number}
                          onChange={(e) => setFormData({...formData, insurance_claim_number: e.target.value})}
                          placeholder="Numéro de sinistre"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="client_address">Adresse complète</Label>
                      <Textarea
                        id="client_address"
                        value={formData.client_address}
                        onChange={(e) => setFormData({...formData, client_address: e.target.value})}
                        placeholder="Adresse postale complète"
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="device" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="device_brand">Marque *</Label>
                        <Input
                          id="device_brand"
                          value={formData.device_brand}
                          onChange={(e) => setFormData({...formData, device_brand: e.target.value})}
                          placeholder="Apple, Samsung, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="device_model">Modèle *</Label>
                        <Input
                          id="device_model"
                          value={formData.device_model}
                          onChange={(e) => setFormData({...formData, device_model: e.target.value})}
                          placeholder="iPhone 13, Galaxy S21, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="device_serial_number">Numéro de série</Label>
                        <Input
                          id="device_serial_number"
                          value={formData.device_serial_number}
                          onChange={(e) => setFormData({...formData, device_serial_number: e.target.value})}
                          placeholder="Numéro de série"
                        />
                      </div>
                      <div>
                        <Label htmlFor="device_imei">IMEI</Label>
                        <Input
                          id="device_imei"
                          value={formData.device_imei}
                          onChange={(e) => setFormData({...formData, device_imei: e.target.value})}
                          placeholder="IMEI de l'appareil"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchase_date">Date d'achat</Label>
                        <Input
                          id="purchase_date"
                          type="date"
                          value={formData.purchase_date}
                          onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchase_price">Prix d'achat (€)</Label>
                        <Input
                          id="purchase_price"
                          type="number"
                          step="0.01"
                          value={formData.purchase_price}
                          onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                          placeholder="799.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchase_store">Magasin d'achat</Label>
                        <Input
                          id="purchase_store"
                          value={formData.purchase_store}
                          onChange={(e) => setFormData({...formData, purchase_store: e.target.value})}
                          placeholder="Nom du magasin"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="diagnostic" className="space-y-4">
                    <div>
                      <Label htmlFor="diagnostic_description">Description du problème *</Label>
                      <Textarea
                        id="diagnostic_description"
                        value={formData.diagnostic_description}
                        onChange={(e) => setFormData({...formData, diagnostic_description: e.target.value})}
                        placeholder="Description détaillée du problème rencontré"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="technical_analysis">Analyse technique *</Label>
                      <Textarea
                        id="technical_analysis"
                        value={formData.technical_analysis}
                        onChange={(e) => setFormData({...formData, technical_analysis: e.target.value})}
                        placeholder="Analyse technique détaillée effectuée"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Composants analysés</h4>
                        <Button type="button" onClick={addDiagnosticComponent} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter composant
                        </Button>
                      </div>
                      {diagnosticComponents.map((component, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Nom du composant</Label>
                              <Input
                                value={component.component_name}
                                onChange={(e) => updateDiagnosticComponent(index, 'component_name', e.target.value)}
                                placeholder="Écran, batterie, carte mère..."
                              />
                            </div>
                            <div>
                              <Label>État</Label>
                              <Input
                                value={component.component_state}
                                onChange={(e) => updateDiagnosticComponent(index, 'component_state', e.target.value)}
                                placeholder="Défaillant, cassé, oxydé..."
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Description de la panne</Label>
                              <Textarea
                                value={component.failure_description}
                                onChange={(e) => updateDiagnosticComponent(index, 'failure_description', e.target.value)}
                                placeholder="Description détaillée de la panne"
                                rows={2}
                              />
                            </div>
                            <div className="col-span-2 flex justify-between items-end">
                              <div className="flex-1 mr-4">
                                <Label>Faisabilité de réparation</Label>
                                <select 
                                  className="w-full p-2 border rounded"
                                  value={component.repair_feasibility}
                                  onChange={(e) => updateDiagnosticComponent(index, 'repair_feasibility', e.target.value)}
                                >
                                  <option value="impossible">Impossible</option>
                                  <option value="non_economique">Non économique</option>
                                  <option value="pieces_indisponibles">Pièces indisponibles</option>
                                </select>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeDiagnosticComponent(index)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="conclusion" className="space-y-4">
                    <div>
                      <Label htmlFor="repair_impossibility_reason">Raison de l'irréparabilité *</Label>
                      <Textarea
                        id="repair_impossibility_reason"
                        value={formData.repair_impossibility_reason}
                        onChange={(e) => setFormData({...formData, repair_impossibility_reason: e.target.value})}
                        placeholder="Explication détaillée des raisons pour lesquelles l'appareil ne peut être réparé"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estimated_repair_cost">Coût de réparation estimé (€)</Label>
                        <Input
                          id="estimated_repair_cost"
                          type="number"
                          step="0.01"
                          value={formData.estimated_repair_cost}
                          onChange={(e) => setFormData({...formData, estimated_repair_cost: e.target.value})}
                          placeholder="450.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="replacement_value">Valeur de remplacement (€)</Label>
                        <Input
                          id="replacement_value"
                          type="number"
                          step="0.01"
                          value={formData.replacement_value}
                          onChange={(e) => setFormData({...formData, replacement_value: e.target.value})}
                          placeholder="299.00"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateCertificate}>
                        Créer le certificat
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {certificates.length === 0 ? (
              <div className="text-center py-8">
                <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun certificat d'irréparabilité</p>
                <p className="text-sm text-muted-foreground">Créez votre premier certificat conforme au Code de la consommation</p>
              </div>
            ) : (
              certificates.map((certificate) => (
                <Card key={certificate.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{certificate.certificate_number}</h3>
                          {getStatusBadge(certificate.certificate_status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {certificate.client_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            {certificate.device_brand} {certificate.device_model}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(certificate.diagnostic_date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Conforme Code consommation
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCertificate(certificate)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {certificate.certificate_status === 'draft' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGeneratePDF(certificate)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Générer PDF
                          </Button>
                        )}
                        {certificate.pdf_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(certificate.pdf_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IrreparabilityCertificateManager;