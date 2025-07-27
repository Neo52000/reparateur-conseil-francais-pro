import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Camera, 
  Calculator, 
  AlertTriangle, 
  Shield,
  FileCheck,
  Euro,
  Smartphone,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EvaluationData {
  // Informations client
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientIdType: 'carte-nationale' | 'passeport' | 'permis-conduire';
  clientIdNumber: string;
  clientIdPhoto?: File;
  
  // Informations appareil
  deviceBrand: string;
  deviceModel: string;
  imei: string;
  storage: string;
  color: string;
  purchaseDate?: string;
  originalPrice?: number;
  
  // État physique
  screenCondition: 'parfait' | 'excellent' | 'bon' | 'raye' | 'fissure' | 'casse';
  bodyCondition: 'parfait' | 'excellent' | 'bon' | 'rayures-mineures' | 'rayures-importantes' | 'impact';
  batteryHealth: number;
  functionalIssues: string[];
  waterDamage: boolean;
  
  // Accessoires
  originalBox: boolean;
  charger: boolean;
  headphones: boolean;
  manual: boolean;
  otherAccessories: string[];
  
  // Photos
  photos: File[];
  
  // Notes
  evaluationNotes: string;
}

interface BuybackEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: EvaluationData) => void;
}

const FUNCTIONAL_ISSUES = [
  'Problème de charge',
  'Problème de batterie',
  'Caméra défaillante',
  'Haut-parleur défaillant',
  'Microphone défaillant',
  'Boutons défaillants',
  'Capteur d\'empreinte défaillant',
  'Face ID défaillant',
  'Connecteur défaillant',
  'WiFi défaillant',
  'Bluetooth défaillant',
  'GPS défaillant'
];

const BuybackEvaluationDialog: React.FC<BuybackEvaluationDialogProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<EvaluationData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    clientIdType: 'carte-nationale',
    clientIdNumber: '',
    deviceBrand: '',
    deviceModel: '',
    imei: '',
    storage: '',
    color: '',
    screenCondition: 'parfait',
    bodyCondition: 'parfait',
    batteryHealth: 100,
    functionalIssues: [],
    waterDamage: false,
    originalBox: false,
    charger: false,
    headphones: false,
    manual: false,
    otherAccessories: [],
    photos: [],
    evaluationNotes: ''
  });
  
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [marginVAT, setMarginVAT] = useState(0);
  const [imeiValidation, setImeiValidation] = useState<'valid' | 'invalid' | 'checking' | null>(null);
  const { toast } = useToast();

  // Validation IMEI
  const validateIMEI = async (imei: string) => {
    if (imei.length !== 15) {
      setImeiValidation('invalid');
      return;
    }
    
    setImeiValidation('checking');
    
    // Simulation de vérification IMEI
    setTimeout(() => {
      // Vérification Luhn algorithm basique
      const isValid = imei.split('').reduce((sum, digit, index) => {
        let n = parseInt(digit);
        if (index % 2 === 1) {
          n *= 2;
          if (n > 9) n = n % 10 + 1;
        }
        return sum + n;
      }, 0) % 10 === 0;
      
      setImeiValidation(isValid ? 'valid' : 'invalid');
      
      if (!isValid) {
        toast({
          title: "IMEI invalide",
          description: "L'IMEI saisi n'est pas valide",
          variant: "destructive"
        });
      }
    }, 1000);
  };

  // Calcul de la valeur estimée
  useEffect(() => {
    if (data.deviceBrand && data.deviceModel) {
      let baseValue = 500; // Valeur de base selon le modèle
      
      // Ajustements selon l'état
      const screenMultiplier = {
        'parfait': 1.0,
        'excellent': 0.95,
        'bon': 0.85,
        'raye': 0.75,
        'fissure': 0.50,
        'casse': 0.20
      };
      
      const bodyMultiplier = {
        'parfait': 1.0,
        'excellent': 0.95,
        'bon': 0.90,
        'rayures-mineures': 0.85,
        'rayures-importantes': 0.70,
        'impact': 0.50
      };
      
      baseValue *= screenMultiplier[data.screenCondition];
      baseValue *= bodyMultiplier[data.bodyCondition];
      
      // Ajustement batterie
      if (data.batteryHealth < 80) baseValue *= 0.90;
      if (data.batteryHealth < 70) baseValue *= 0.80;
      if (data.batteryHealth < 60) baseValue *= 0.70;
      
      // Pénalités problèmes fonctionnels
      baseValue -= data.functionalIssues.length * 30;
      
      // Pénalité dégât des eaux
      if (data.waterDamage) baseValue *= 0.30;
      
      // Bonus accessoires
      let accessoryBonus = 0;
      if (data.originalBox) accessoryBonus += 20;
      if (data.charger) accessoryBonus += 15;
      if (data.headphones) accessoryBonus += 10;
      if (data.manual) accessoryBonus += 5;
      
      baseValue += accessoryBonus;
      
      const finalValue = Math.max(0, Math.round(baseValue));
      setEstimatedValue(finalValue);
      
      // Calcul TVA sur marge (20% de la marge de revente estimée)
      const estimatedResalePrice = finalValue * 1.4; // Marge de 40%
      const margin = estimatedResalePrice - finalValue;
      setMarginVAT(Math.round(margin * 0.2));
    }
  }, [data]);

  const updateData = (field: keyof EvaluationData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleIMEIChange = (imei: string) => {
    updateData('imei', imei);
    if (imei.length === 15) {
      validateIMEI(imei);
    } else {
      setImeiValidation(null);
    }
  };

  const handleFileUpload = (files: FileList | null, type: 'photos' | 'clientIdPhoto') => {
    if (!files) return;
    
    if (type === 'photos') {
      const newPhotos = Array.from(files);
      updateData('photos', [...data.photos, ...newPhotos]);
    } else {
      updateData('clientIdPhoto', files[0]);
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 5) * 100;
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return data.clientName && data.clientPhone && data.clientIdNumber && data.clientAddress;
      case 2:
        return data.deviceBrand && data.deviceModel && data.imei && imeiValidation === 'valid';
      case 3:
        return true; // État physique toujours valide
      case 4:
        return data.photos.length >= 3; // Au moins 3 photos requises
      case 5:
        return true; // Révision finale
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Identification du client</h3>
              <p className="text-muted-foreground">Informations requises pour la conformité légale</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet *</label>
                <Input
                  value={data.clientName}
                  onChange={(e) => updateData('clientName', e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone *</label>
                <Input
                  value={data.clientPhone}
                  onChange={(e) => updateData('clientPhone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={data.clientEmail}
                  onChange={(e) => updateData('clientEmail', e.target.value)}
                  placeholder="jean.dupont@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de pièce d'identité</label>
                <Select value={data.clientIdType} onValueChange={(value) => updateData('clientIdType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carte-nationale">Carte nationale d'identité</SelectItem>
                    <SelectItem value="passeport">Passeport</SelectItem>
                    <SelectItem value="permis-conduire">Permis de conduire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Numéro de pièce d'identité *</label>
                <Input
                  value={data.clientIdNumber}
                  onChange={(e) => updateData('clientIdNumber', e.target.value)}
                  placeholder="Numéro de pièce"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo de la pièce d'identité</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'clientIdPhoto')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse complète *</label>
              <Textarea
                value={data.clientAddress}
                onChange={(e) => updateData('clientAddress', e.target.value)}
                placeholder="Adresse complète du domicile"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Identification de l'appareil</h3>
              <p className="text-muted-foreground">Caractéristiques techniques et numéro IMEI</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Marque *</label>
                <Select value={data.deviceBrand} onValueChange={(value) => updateData('deviceBrand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apple">Apple</SelectItem>
                    <SelectItem value="Samsung">Samsung</SelectItem>
                    <SelectItem value="Huawei">Huawei</SelectItem>
                    <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                    <SelectItem value="OnePlus">OnePlus</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modèle *</label>
                <Input
                  value={data.deviceModel}
                  onChange={(e) => updateData('deviceModel', e.target.value)}
                  placeholder="iPhone 13, Galaxy S21..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacité de stockage</label>
                <Select value={data.storage} onValueChange={(value) => updateData('storage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Capacité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="64GB">64 GB</SelectItem>
                    <SelectItem value="128GB">128 GB</SelectItem>
                    <SelectItem value="256GB">256 GB</SelectItem>
                    <SelectItem value="512GB">512 GB</SelectItem>
                    <SelectItem value="1TB">1 TB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Couleur</label>
                <Input
                  value={data.color}
                  onChange={(e) => updateData('color', e.target.value)}
                  placeholder="Noir, Blanc, Bleu..."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                IMEI * 
                {imeiValidation === 'checking' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                {imeiValidation === 'valid' && <FileCheck className="w-4 h-4 text-green-600" />}
                {imeiValidation === 'invalid' && <AlertTriangle className="w-4 h-4 text-red-600" />}
              </label>
              <Input
                value={data.imei}
                onChange={(e) => handleIMEIChange(e.target.value)}
                placeholder="Numéro IMEI (15 chiffres)"
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                Tapez *#06# sur l'appareil pour afficher l'IMEI
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'achat (optionnel)</label>
                <Input
                  type="date"
                  value={data.purchaseDate}
                  onChange={(e) => updateData('purchaseDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix d'achat (optionnel)</label>
                <Input
                  type="number"
                  value={data.originalPrice}
                  onChange={(e) => updateData('originalPrice', parseFloat(e.target.value))}
                  placeholder="Prix en euros"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Évaluation de l'état</h3>
              <p className="text-muted-foreground">État physique et fonctionnel de l'appareil</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">État de l'écran</label>
                  <Select value={data.screenCondition} onValueChange={(value) => updateData('screenCondition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parfait">Parfait - Aucune trace</SelectItem>
                      <SelectItem value="excellent">Excellent - Micro-rayures invisibles</SelectItem>
                      <SelectItem value="bon">Bon - Quelques rayures</SelectItem>
                      <SelectItem value="raye">Rayé - Rayures visibles</SelectItem>
                      <SelectItem value="fissure">Fissuré - Fissures sans impact</SelectItem>
                      <SelectItem value="casse">Cassé - Impact ou écran brisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">État du châssis</label>
                  <Select value={data.bodyCondition} onValueChange={(value) => updateData('bodyCondition', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parfait">Parfait - Comme neuf</SelectItem>
                      <SelectItem value="excellent">Excellent - Traces d'usage minimes</SelectItem>
                      <SelectItem value="bon">Bon - Usure normale</SelectItem>
                      <SelectItem value="rayures-mineures">Rayures mineures</SelectItem>
                      <SelectItem value="rayures-importantes">Rayures importantes</SelectItem>
                      <SelectItem value="impact">Impact ou enfoncement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Santé de la batterie (%)</label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={data.batteryHealth}
                      onChange={(e) => updateData('batteryHealth', parseInt(e.target.value))}
                    />
                    <Progress value={data.batteryHealth} className="w-full" />
                  </div>
                   <p className="text-xs text-muted-foreground">
                     iOS: Réglages &gt; Batterie &gt; Santé de la batterie
                   </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Problèmes fonctionnels</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {FUNCTIONAL_ISSUES.map((issue) => (
                      <div key={issue} className="flex items-center space-x-2">
                        <Checkbox
                          id={issue}
                          checked={data.functionalIssues.includes(issue)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateData('functionalIssues', [...data.functionalIssues, issue]);
                            } else {
                              updateData('functionalIssues', data.functionalIssues.filter(i => i !== issue));
                            }
                          }}
                        />
                        <label htmlFor={issue} className="text-sm">{issue}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="waterDamage"
                    checked={data.waterDamage}
                    onCheckedChange={(checked) => updateData('waterDamage', checked)}
                  />
                  <label htmlFor="waterDamage" className="text-sm font-medium text-red-600">
                    Dégât des eaux / Oxydation
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Accessoires inclus</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="originalBox"
                    checked={data.originalBox}
                    onCheckedChange={(checked) => updateData('originalBox', checked)}
                  />
                  <label htmlFor="originalBox" className="text-sm">Boîte d'origine (+20€)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charger"
                    checked={data.charger}
                    onCheckedChange={(checked) => updateData('charger', checked)}
                  />
                  <label htmlFor="charger" className="text-sm">Chargeur d'origine (+15€)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="headphones"
                    checked={data.headphones}
                    onCheckedChange={(checked) => updateData('headphones', checked)}
                  />
                  <label htmlFor="headphones" className="text-sm">Écouteurs (+10€)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manual"
                    checked={data.manual}
                    onCheckedChange={(checked) => updateData('manual', checked)}
                  />
                  <label htmlFor="manual" className="text-sm">Manuel/Documentation (+5€)</label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Documentation photographique</h3>
              <p className="text-muted-foreground">Photos requises pour l'évaluation et la traçabilité</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Photos de l'appareil (minimum 3) *</label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'photos')}
                />
                <p className="text-xs text-muted-foreground">
                  Photos requises : Face avant, face arrière, tranche avec ports, écran allumé
                </p>
              </div>
              
              {data.photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Photos ajoutées ({data.photos.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {data.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={URL.createObjectURL(photo)} 
                          alt={`Photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                          onClick={() => {
                            const newPhotos = data.photos.filter((_, i) => i !== index);
                            updateData('photos', newPhotos);
                          }}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes d'évaluation</label>
              <Textarea
                value={data.evaluationNotes}
                onChange={(e) => updateData('evaluationNotes', e.target.value)}
                placeholder="Observations particulières, défauts constatés, points d'attention..."
                rows={4}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Euro className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Offre de rachat</h3>
              <p className="text-muted-foreground">Récapitulatif et proposition de prix</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé de l'évaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Appareil :</span>
                    <span className="font-medium">{data.deviceBrand} {data.deviceModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IMEI :</span>
                    <span className="font-mono text-sm">{data.imei}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>État écran :</span>
                    <Badge variant="outline">{data.screenCondition}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>État châssis :</span>
                    <Badge variant="outline">{data.bodyCondition}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Batterie :</span>
                    <span>{data.batteryHealth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Problèmes :</span>
                    <span>{data.functionalIssues.length || 'Aucun'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accessoires :</span>
                    <span>{[data.originalBox, data.charger, data.headphones, data.manual].filter(Boolean).length}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Offre financière</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Valeur estimée :</span>
                    <span className="font-bold text-primary">{estimatedValue}€</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Prix de revente estimé :</span>
                      <span>{Math.round(estimatedValue * 1.4)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marge commerciale :</span>
                      <span>{Math.round(estimatedValue * 0.4)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA sur marge (20%) :</span>
                      <span>{marginVAT}€</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Commission plateforme (5%) :</span>
                      <span>-{Math.round(estimatedValue * 0.05)}€</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2">
                      <span>Offre finale :</span>
                      <span className="text-green-600">{Math.round(estimatedValue * 0.95)}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Conditions de rachat</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Paiement immédiat par espèces ou virement</li>
                <li>• Garantie d'authenticité et de fonctionnement</li>
                <li>• Appareil débloqué et réinitialisé</li>
                <li>• TVA sur marge appliquée selon la réglementation</li>
                <li>• Enregistrement au livre de police numérique</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleComplete = () => {
    onComplete(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Évaluation de rachat - Étape {currentStep}/5
            <Badge variant="outline">{Math.round(getProgressPercentage())}%</Badge>
          </DialogTitle>
          <Progress value={getProgressPercentage()} className="w-full" />
        </DialogHeader>
        
        <div className="py-6">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Précédent
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            
            {currentStep < 5 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNext()}
              >
                Suivant
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!canProceedToNext()}>
                Finaliser l'évaluation
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuybackEvaluationDialog;