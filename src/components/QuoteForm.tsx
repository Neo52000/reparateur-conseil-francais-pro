
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuoteFormProps {
  repairerId?: string;
  onSuccess?: () => void;
}

const QuoteForm = ({ repairerId, onSuccess }: QuoteFormProps) => {
  const [formData, setFormData] = useState({
    device_brand: '',
    device_model: '',
    issue_type: '',
    issue_description: '',
    contact_email: '',
    contact_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deviceBrands = ['iPhone', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google Pixel', 'Autre'];
  const issueTypes = ['Écran cassé', 'Batterie', 'Réparation eau', 'Connecteur charge', 'Appareil photo', 'Haut-parleur', 'Autre'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour demander un devis",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('quotes')
        .insert({
          ...formData,
          user_id: user.id,
          repairer_id: repairerId
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre demande de devis a été envoyée avec succès"
      });

      setFormData({
        device_brand: '',
        device_model: '',
        issue_type: '',
        issue_description: '',
        contact_email: '',
        contact_phone: ''
      });

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
        <CardTitle>Demander un devis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="device_brand">Marque de l'appareil</Label>
              <Select value={formData.device_brand} onValueChange={(value) => setFormData({...formData, device_brand: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque" />
                </SelectTrigger>
                <SelectContent>
                  {deviceBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="device_model">Modèle</Label>
              <Input
                id="device_model"
                value={formData.device_model}
                onChange={(e) => setFormData({...formData, device_model: e.target.value})}
                placeholder="ex: iPhone 14 Pro"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="issue_type">Type de panne</Label>
            <Select value={formData.issue_type} onValueChange={(value) => setFormData({...formData, issue_type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de panne" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="issue_description">Description détaillée</Label>
            <Textarea
              id="issue_description"
              value={formData.issue_description}
              onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
              placeholder="Décrivez le problème en détail..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                placeholder="Optionnel"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteForm;
