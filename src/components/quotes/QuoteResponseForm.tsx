import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  User, 
  Euro, 
  Clock, 
  Shield,
  Send,
  Calculator
} from 'lucide-react';

interface Quote {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  status: string;
  created_at: string;
}

interface QuoteResponseFormProps {
  quote: Quote;
  onSuccess: () => void;
}

export const QuoteResponseForm: React.FC<QuoteResponseFormProps> = ({
  quote,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estimated_price: '',
    parts_cost: '',
    labor_cost: '',
    repair_duration: '',
    warranty_period_days: '180',
    repairer_notes: '',
    warranty_info: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.estimated_price) {
      toast({
        title: "Prix requis",
        description: "Veuillez indiquer un prix estimé",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Calculer la deadline d'acceptation client (7 jours par défaut)
      const clientDeadline = new Date();
      clientDeadline.setDate(clientDeadline.getDate() + 7);

      const { error } = await supabase
        .from('quotes_with_timeline')
        .update({
          status: 'quoted',
          estimated_price: parseFloat(formData.estimated_price),
          parts_cost: formData.parts_cost ? parseFloat(formData.parts_cost) : null,
          labor_cost: formData.labor_cost ? parseFloat(formData.labor_cost) : null,
          repair_duration: formData.repair_duration || null,
          warranty_period_days: parseInt(formData.warranty_period_days),
          repairer_notes: formData.repairer_notes || null,
          warranty_info: formData.warranty_info || null,
          quoted_at: new Date().toISOString(),
          client_acceptance_deadline: clientDeadline.toISOString()
        })
        .eq('id', quote.id);

      if (error) throw error;

      toast({
        title: "Devis envoyé !",
        description: "Votre devis a été envoyé au client. Il a 7 jours pour répondre."
      });

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le devis. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const parts = parseFloat(formData.parts_cost) || 0;
    const labor = parseFloat(formData.labor_cost) || 0;
    return parts + labor;
  };

  return (
    <div className="space-y-6">
      {/* Résumé de la demande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Demande de devis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Client:</span>
                <span>{quote.client_name || 'Nom non renseigné'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Appareil:</span>
                <span>{quote.device_brand} {quote.device_model}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">{quote.repair_type}</Badge>
              <p className="text-sm text-muted-foreground">
                Demandé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-2">Description du problème:</p>
            <p className="text-sm bg-muted p-3 rounded">{quote.issue_description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de réponse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Votre devis
          </CardTitle>
          <CardDescription>
            Remplissez les détails de votre devis professionnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tarification */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Tarification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parts_cost">Coût des pièces (€)</Label>
                  <Input
                    id="parts_cost"
                    type="number"
                    step="0.01"
                    value={formData.parts_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, parts_cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor_cost">Coût main d'œuvre (€)</Label>
                  <Input
                    id="labor_cost"
                    type="number"
                    step="0.01"
                    value={formData.labor_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, labor_cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_price">Prix total TTC (€) *</Label>
                  <Input
                    id="estimated_price"
                    type="number"
                    step="0.01"
                    value={formData.estimated_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                  {formData.parts_cost && formData.labor_cost && (
                    <p className="text-xs text-muted-foreground">
                      Calculé automatiquement: {calculateTotal().toFixed(2)}€
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="ml-2 h-auto p-0 text-xs"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          estimated_price: calculateTotal().toFixed(2) 
                        }))}
                      >
                        Utiliser ce montant
                      </Button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Délais et garantie */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Délais et garantie
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repair_duration">Durée estimée de réparation</Label>
                  <Select value={formData.repair_duration} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, repair_duration: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 heure">1 heure</SelectItem>
                      <SelectItem value="2 heures">2 heures</SelectItem>
                      <SelectItem value="Demi-journée">Demi-journée</SelectItem>
                      <SelectItem value="1 jour">1 jour</SelectItem>
                      <SelectItem value="2-3 jours">2-3 jours</SelectItem>
                      <SelectItem value="1 semaine">1 semaine</SelectItem>
                      <SelectItem value="2 semaines">2 semaines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty_period_days">Garantie (jours)</Label>
                  <Select value={formData.warranty_period_days} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, warranty_period_days: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                      <SelectItem value="180">180 jours (recommandé)</SelectItem>
                      <SelectItem value="365">1 an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Détails de la garantie */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Détails
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty_info">Conditions de garantie</Label>
                  <Textarea
                    id="warranty_info"
                    value={formData.warranty_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, warranty_info: e.target.value }))}
                    placeholder="Décrivez ce qui est couvert par la garantie (défauts de fabrication, main d'œuvre...)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repairer_notes">Notes techniques</Label>
                  <Textarea
                    id="repairer_notes"
                    value={formData.repairer_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, repairer_notes: e.target.value }))}
                    placeholder="Informations complémentaires, recommandations, précautions..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                "Envoi en cours..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le devis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};