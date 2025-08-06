
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RepairerProfile, LANGUAGES, PAYMENT_METHODS } from '@/types/repairerProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BusinessInfoSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

// Simplified approvals list
const APPROVALS = [
  { value: 'apple', label: 'Agréé Apple' },
  { value: 'samsung', label: 'Agréé Samsung' }
];

const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({ formData, setFormData }) => {
  const handleArrayFieldChange = (field: keyof RepairerProfile, value: string, checked: boolean) => {
    const currentArray = (formData[field] as string[]) || [];
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentArray, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: currentArray.filter(item => item !== value)
      }));
    }
  };

  const handlePricingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      pricing_info: {
        ...prev.pricing_info,
        [field]: field === 'free_quote' ? value === 'true' : parseFloat(value) || 0
      }
    }));
  };

  const handleCustomApprovalChange = (value: string) => {
    const currentCertifications = formData.certifications || [];
    const otherCertifications = currentCertifications.filter(cert => cert !== 'apple' && cert !== 'samsung');
    
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...otherCertifications, 'apple', 'samsung'].filter(cert => 
          (cert === 'apple' && currentCertifications.includes('apple')) ||
          (cert === 'samsung' && currentCertifications.includes('samsung')) ||
          (cert !== 'apple' && cert !== 'samsung')
        ).concat(value.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        certifications: currentCertifications.filter(cert => cert === 'apple' || cert === 'samsung')
      }));
    }
  };

  const getCustomApprovalValue = () => {
    const currentCertifications = formData.certifications || [];
    const customCert = currentCertifications.find(cert => cert !== 'apple' && cert !== 'samsung');
    return customCert || '';
  };

  return (
    <div className="space-y-6">
      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years_experience">Années d'expérience</Label>
              <Input
                id="years_experience"
                type="number"
                value={formData.years_experience || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty_duration">Durée de garantie</Label>
              <Select
                value={formData.warranty_duration || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, warranty_duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3_mois">3 mois</SelectItem>
                  <SelectItem value="6_mois">6 mois</SelectItem>
                  <SelectItem value="1_an">1 an</SelectItem>
                  <SelectItem value="2_ans">2 ans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_time">Temps de réponse</Label>
              <Select
                value={formData.response_time || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, response_time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiat</SelectItem>
                  <SelectItem value="1h">Dans l'heure</SelectItem>
                  <SelectItem value="2h">2 heures</SelectItem>
                  <SelectItem value="24h">24 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Options de service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency_service"
                checked={formData.emergency_service || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emergency_service: checked as boolean }))}
              />
              <Label htmlFor="emergency_service">Service d'urgence</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="home_service"
                checked={formData.home_service || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, home_service: checked as boolean }))}
              />
              <Label htmlFor="home_service">Service à domicile</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="pickup_service"
                checked={formData.pickup_service || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pickup_service: checked as boolean }))}
              />
              <Label htmlFor="pickup_service">Service de collecte</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarification */}
      <Card>
        <CardHeader>
          <CardTitle>Informations tarifaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagnostic_fee">Frais de diagnostic (€)</Label>
              <Input
                id="diagnostic_fee"
                type="number"
                step="0.01"
                value={formData.pricing_info?.diagnostic_fee || ''}
                onChange={(e) => handlePricingChange('diagnostic_fee', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_repair_cost">Coût minimum de réparation (€)</Label>
              <Input
                id="min_repair_cost"
                type="number"
                step="0.01"
                value={formData.pricing_info?.min_repair_cost || ''}
                onChange={(e) => handlePricingChange('min_repair_cost', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Tarif horaire (€)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                value={formData.pricing_info?.hourly_rate || ''}
                onChange={(e) => handlePricingChange('hourly_rate', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="free_quote"
                checked={formData.pricing_info?.free_quote || false}
                onCheckedChange={(checked) => handlePricingChange('free_quote', String(checked))}
              />
              <Label htmlFor="free_quote">Devis gratuit</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Langues parlées */}
      <Card>
        <CardHeader>
          <CardTitle>Langues parlées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {LANGUAGES.map((language) => (
              <div key={language.value} className="flex items-center space-x-2">
                <Checkbox
                  id={language.value}
                  checked={(formData.languages_spoken || []).includes(language.value)}
                  onCheckedChange={(checked) => handleArrayFieldChange('languages_spoken', language.value, checked as boolean)}
                />
                <Label htmlFor={language.value}>{language.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Moyens de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Moyens de paiement acceptés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map((method) => (
              <div key={method.value} className="flex items-center space-x-2">
                <Checkbox
                  id={method.value}
                  checked={(formData.payment_methods || []).includes(method.value)}
                  onCheckedChange={(checked) => handleArrayFieldChange('payment_methods', method.value, checked as boolean)}
                />
                <Label htmlFor={method.value}>{method.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agréments */}
      <Card>
        <CardHeader>
          <CardTitle>Agréments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APPROVALS.map((approval) => (
              <div key={approval.value} className="flex items-center space-x-2">
                <Checkbox
                  id={approval.value}
                  checked={(formData.certifications || []).includes(approval.value)}
                  onCheckedChange={(checked) => handleArrayFieldChange('certifications', approval.value, checked as boolean)}
                />
                <Label htmlFor={approval.value}>{approval.label}</Label>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom_approval">Agréé (à compléter par le réparateur)</Label>
            <Input
              id="custom_approval"
              value={getCustomApprovalValue()}
              onChange={(e) => handleCustomApprovalChange(e.target.value)}
              placeholder="Entrez votre agrément personnalisé"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessInfoSection;
