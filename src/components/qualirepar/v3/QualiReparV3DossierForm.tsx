import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQualiReparV3Validation } from '@/hooks/useQualiReparV3Validation';
import { useQualiReparV3DocumentManager } from '@/hooks/useQualiReparV3DocumentManager';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface QualiReparV3DossierFormProps {
  onSuccess?: (dossierId: string) => void;
  onCancel?: () => void;
}

export const QualiReparV3DossierForm: React.FC<QualiReparV3DossierFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    device_brand: '',
    device_model: '',
    device_serial: '',
    issue_description: '',
    estimated_cost: '',
    repair_type: 'screen_replacement',
    repairer_siret: '',
    iris_code: ''
  });

  const [loading, setLoading] = useState(false);
  const { validateBusinessData } = useQualiReparV3Validation();
  const { uploadDocument, uploading } = useQualiReparV3DocumentManager();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation business
      const validationResult = await validateBusinessData({
        siret: formData.repairer_siret,
        irisCode: formData.iris_code,
        estimatedCost: parseFloat(formData.estimated_cost)
      });

      if (!validationResult.isValid) {
        toast.error('Données invalides', {
          description: validationResult.errors.join(', ')
        });
        return;
      }

      // Création du dossier
      const response = await fetch('/api/qualirepar-v3/dossier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du dossier');
      }

      const { dossier_id } = await response.json();
      
      toast.success('Dossier créé avec succès');
      onSuccess?.(dossier_id);

    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    setUploadProgress(0);
    try {
      const result = await uploadDocument(file, {
        fileType: documentType as any,
        reimbursementClaimId: 'temp-dossier-id',
        maxSizeInMB: 10
      });
      if (result.success) {
        setUploadProgress(100);
        toast.success('Document téléchargé avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
      setValidationErrors([error.message]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nouveau Dossier QualiRépar V3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations Client */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Nom du Client *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone">Téléphone *</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => handleInputChange('client_phone', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Informations Appareil */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device_brand">Marque *</Label>
                <Select onValueChange={(value) => handleInputChange('device_brand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="samsung">Samsung</SelectItem>
                    <SelectItem value="xiaomi">Xiaomi</SelectItem>
                    <SelectItem value="huawei">Huawei</SelectItem>
                    <SelectItem value="oppo">Oppo</SelectItem>
                    <SelectItem value="oneplus">OnePlus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="device_model">Modèle *</Label>
                <Input
                  id="device_model"
                  value={formData.device_model}
                  onChange={(e) => handleInputChange('device_model', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device_serial">Numéro de Série</Label>
                <Input
                  id="device_serial"
                  value={formData.device_serial}
                  onChange={(e) => handleInputChange('device_serial', e.target.value)}
                />
              </div>
            </div>

            {/* Informations Réparation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repair_type">Type de Réparation *</Label>
                <Select onValueChange={(value) => handleInputChange('repair_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de réparation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screen_replacement">Remplacement Écran</SelectItem>
                    <SelectItem value="battery_replacement">Remplacement Batterie</SelectItem>
                    <SelectItem value="camera_repair">Réparation Caméra</SelectItem>
                    <SelectItem value="charging_port">Port de Charge</SelectItem>
                    <SelectItem value="water_damage">Dégât des Eaux</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Coût Estimé (€) *</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => handleInputChange('estimated_cost', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_description">Description du Problème *</Label>
              <Textarea
                id="issue_description"
                value={formData.issue_description}
                onChange={(e) => handleInputChange('issue_description', e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Informations Réparateur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repairer_siret">SIRET Réparateur *</Label>
                <Input
                  id="repairer_siret"
                  value={formData.repairer_siret}
                  onChange={(e) => handleInputChange('repairer_siret', e.target.value)}
                  placeholder="14 chiffres"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iris_code">Code IRIS</Label>
                <Input
                  id="iris_code"
                  value={formData.iris_code}
                  onChange={(e) => handleInputChange('iris_code', e.target.value)}
                  placeholder="Code géographique IRIS"
                />
              </div>
            </div>

            {/* Zone de téléchargement */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-sm font-medium mb-1">Documents Requis</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Facture, Bon de dépôt, Photo série (glissez-déposez ou cliquez)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleFileUpload(file, 'FACTURE'));
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner les fichiers
                </Button>
              </div>
              
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Téléchargement...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Erreurs de validation</span>
                </div>
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Créer le Dossier
                  </>
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};