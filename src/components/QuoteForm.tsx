
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCatalog } from '@/hooks/useCatalog';

interface QuoteFormProps {
  repairerId?: string;
  onSuccess?: () => void;
}

const QuoteForm = ({ repairerId, onSuccess }: QuoteFormProps) => {
  const { brands: catalogBrands, deviceTypes, repairTypes, loading: catalogLoading } = useCatalog();
  const [formData, setFormData] = useState({
    deviceType: '',
    brand: '',
    model: '',
    issueType: '',
    description: '',
    urgency: '',
    budget: '',
    contactMethod: 'email'
  });
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Utiliser les vraies données du catalogue
  const deviceTypeNames = deviceTypes.map(type => type.name).sort();
  const brandNames = catalogBrands.map(brand => brand.name).sort();
  const issueTypeNames = repairTypes.map(repair => repair.name).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptsTerms) {
      toast({
        title: "Conditions d'utilisation",
        description: "Veuillez accepter les conditions d'utilisation",
        variant: "destructive"
      });
      return;
    }

    if (!formData.deviceType || !formData.brand || !formData.model || !formData.issueType) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour demander un devis",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          repairer_id: repairerId,
          device_brand: formData.brand,
          device_model: formData.model,
          issue_type: formData.issueType,
          issue_description: `${formData.issueType}: ${formData.description}`,
          contact_email: user.email || '',
          contact_phone: '',
          estimated_price: formData.budget ? parseFloat(formData.budget) : null
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de devis a été transmise avec succès"
      });

      // Reset form
      setFormData({
        deviceType: '',
        brand: '',
        model: '',
        issueType: '',
        description: '',
        urgency: '',
        budget: '',
        contactMethod: 'email'
      });
      setAcceptsTerms(false);

      onSuccess?.();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de devis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Devis indicatif</p>
            <p>
              Ce devis sera établi à titre indicatif seulement. Le réparateur devra effectuer 
              un diagnostic réel de votre appareil pour confirmer le prix final et la faisabilité 
              de la réparation.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type d'appareil */}
        <div>
          <Label htmlFor="deviceType">Type d'appareil *</Label>
          <Select value={formData.deviceType} onValueChange={(value) => setFormData({...formData, deviceType: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type d'appareil" />
            </SelectTrigger>
            <SelectContent>
              {deviceTypeNames.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Marque */}
          <div>
            <Label htmlFor="brand">Marque *</Label>
            <Select value={formData.brand} onValueChange={(value) => setFormData({...formData, brand: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Marque" />
              </SelectTrigger>
              <SelectContent>
                {catalogLoading ? (
                  <SelectItem value="" disabled>Chargement...</SelectItem>
                ) : (
                  brandNames.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Modèle */}
          <div>
            <Label htmlFor="model">Modèle *</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="ex: iPhone 14, Galaxy S23, ThinkPad X1..."
              required
            />
          </div>
        </div>

        {/* Type de panne */}
        <div>
          <Label htmlFor="issueType">Type de panne *</Label>
          <Select value={formData.issueType} onValueChange={(value) => setFormData({...formData, issueType: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Quel est le problème ?" />
            </SelectTrigger>
            <SelectContent>
              {catalogLoading ? (
                <SelectItem value="" disabled>Chargement...</SelectItem>
              ) : (
                issueTypeNames.map((issue) => (
                  <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Description complémentaire */}
        <div>
          <Label htmlFor="description">Description complémentaire</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Décrivez précisément le problème, les circonstances, les symptômes observés..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Plus votre description est précise, plus le devis sera exact
          </p>
        </div>

        {/* Urgence */}
        <div>
          <Label>Niveau d'urgence</Label>
          <RadioGroup 
            value={formData.urgency} 
            onValueChange={(value) => setFormData({...formData, urgency: value})}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low">Pas urgent (dans la semaine)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Modéré (dans 2-3 jours)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high">Urgent (dans la journée)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Budget */}
        <div>
          <Label htmlFor="budget">Budget approximatif (optionnel)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
            placeholder="ex: 150"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            En euros - cela nous aide à vous proposer des solutions adaptées
          </p>
        </div>

        {/* Méthode de contact */}
        <div>
          <Label>Méthode de contact préférée</Label>
          <RadioGroup 
            value={formData.contactMethod} 
            onValueChange={(value) => setFormData({...formData, contactMethod: value})}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phone" id="phone" />
              <Label htmlFor="phone">Téléphone</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sms" id="sms" />
              <Label htmlFor="sms">SMS</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Conditions */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptsTerms}
            onCheckedChange={(checked) => setAcceptsTerms(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm">
            J'accepte les conditions d'utilisation et la politique de confidentialité
          </Label>
        </div>

        <Button type="submit" disabled={loading || !acceptsTerms} className="w-full">
          {loading ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
        </Button>
      </form>

      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <p className="text-sm text-green-800">
          <strong>✅ Gratuit et sans engagement</strong> - Vous recevrez une réponse sous 24h en moyenne
        </p>
      </div>
    </div>
  );
};

export default QuoteForm;
