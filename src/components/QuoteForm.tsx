
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Upload, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuoteFormProps {
  repairerId?: string;
  onSuccess?: () => void;
}

const QuoteForm = ({ repairerId, onSuccess }: QuoteFormProps) => {
  const [formData, setFormData] = useState({
    deviceType: '',
    brand: '',
    model: '',
    problem: '',
    description: '',
    urgency: '',
    budget: '',
    contactMethod: 'email'
  });
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deviceTypes = [
    'Smartphone',
    'Tablette',
    'Ordinateur portable',
    'Ordinateur de bureau',
    'Console de jeux',
    'Autre'
  ];

  const brands = [
    'Apple',
    'Samsung',
    'Huawei',
    'Xiaomi',
    'OnePlus',
    'Google',
    'Sony',
    'LG',
    'Oppo',
    'Autre'
  ];

  const commonProblems = [
    'Écran cassé',
    'Batterie défaillante',
    'Problème de charge',
    'Dégât des eaux',
    'Appareil photo défaillant',
    'Haut-parleur défaillant',
    'Boutons cassés',
    'Problème logiciel',
    'Autre problème'
  ];

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
          device_type: formData.deviceType,
          device_brand: formData.brand,
          device_model: formData.model,
          problem_description: `${formData.problem}: ${formData.description}`,
          urgency_level: formData.urgency,
          estimated_budget: formData.budget ? parseFloat(formData.budget) : null,
          preferred_contact_method: formData.contactMethod
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
        problem: '',
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Demande de devis gratuit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d'appareil */}
          <div>
            <Label htmlFor="deviceType">Type d'appareil *</Label>
            <Select value={formData.deviceType} onValueChange={(value) => setFormData({...formData, deviceType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type d'appareil" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
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
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
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
                placeholder="ex: iPhone 14, Galaxy S23..."
                required
              />
            </div>
          </div>

          {/* Problème */}
          <div>
            <Label htmlFor="problem">Type de problème *</Label>
            <Select value={formData.problem} onValueChange={(value) => setFormData({...formData, problem: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Quel est le problème ?" />
              </SelectTrigger>
              <SelectContent>
                {commonProblems.map((problem) => (
                  <SelectItem key={problem} value={problem}>{problem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez précisément le problème, les circonstances, les symptômes..."
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Urgence */}
          <div>
            <Label>Niveau d'urgence *</Label>
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
              onCheckedChange={setAcceptsTerms}
            />
            <Label htmlFor="terms" className="text-sm">
              J'accepte les conditions d'utilisation et la politique de confidentialité
            </Label>
          </div>

          <Button type="submit" disabled={loading || !acceptsTerms} className="w-full">
            {loading ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Gratuit et sans engagement</strong> - Vous recevrez une réponse sous 24h en moyenne
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteForm;
