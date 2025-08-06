import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Smartphone, FileText, User } from 'lucide-react';

interface QuoteRequestFormProps {
  repairerId: string;
  repairerName: string;
  onSuccess?: () => void;
}

export const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  repairerId,
  repairerName,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_brand: '',
    device_model: '',
    repair_type: '',
    issue_description: '',
    client_email: user?.email || '',
    client_phone: '',
    client_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour demander un devis",
        variant: "destructive"
      });
      return;
    }

    if (!formData.device_brand || !formData.device_model || !formData.repair_type || !formData.issue_description || !formData.client_email) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Calculer la deadline de réponse (24h par défaut)
      const responseDeadline = new Date();
      responseDeadline.setDate(responseDeadline.getDate() + 1);

      const { error } = await supabase
        .from('quotes_with_timeline')
        .insert({
          client_id: user.id,
          repairer_id: repairerId,
          device_brand: formData.device_brand,
          device_model: formData.device_model,
          repair_type: formData.repair_type,
          issue_description: formData.issue_description,
          client_email: formData.client_email,
          client_phone: formData.client_phone || null,
          client_name: formData.client_name || null,
          status: 'pending',
          repairer_response_deadline: responseDeadline.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: `Votre demande de devis a été envoyée à ${repairerName}. Vous recevrez une réponse sous 24h.`
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande. Réessayez.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Demande de devis
        </CardTitle>
        <CardDescription>
          Décrivez votre problème pour recevoir un devis de {repairerName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Vos informations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">Téléphone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Nom complet</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Votre nom et prénom"
              />
            </div>
          </div>

          {/* Informations de l'appareil */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Informations de l'appareil
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device_brand">Marque *</Label>
                <Select value={formData.device_brand} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, device_brand: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la marque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apple">Apple</SelectItem>
                    <SelectItem value="Samsung">Samsung</SelectItem>
                    <SelectItem value="Huawei">Huawei</SelectItem>
                    <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                    <SelectItem value="OnePlus">OnePlus</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Sony">Sony</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="device_model">Modèle *</Label>
                <Input
                  id="device_model"
                  value={formData.device_model}
                  onChange={(e) => setFormData(prev => ({ ...prev, device_model: e.target.value }))}
                  placeholder="ex: iPhone 14, Galaxy S23..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repair_type">Type de réparation *</Label>
              <Select value={formData.repair_type} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, repair_type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de réparation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Écran cassé">📱 Écran cassé</SelectItem>
                  <SelectItem value="Batterie défaillante">🔋 Batterie défaillante</SelectItem>
                  <SelectItem value="Problème de charge">⚡ Problème de charge</SelectItem>
                  <SelectItem value="Problème audio">🔊 Problème audio</SelectItem>
                  <SelectItem value="Problème appareil photo">📷 Problème appareil photo</SelectItem>
                  <SelectItem value="Problème tactile">👆 Problème tactile</SelectItem>
                  <SelectItem value="Oxydation">💧 Oxydation / Dégâts des eaux</SelectItem>
                  <SelectItem value="Diagnostic">🔍 Diagnostic général</SelectItem>
                  <SelectItem value="Autre">🔧 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description du problème */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description du problème
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="issue_description">Décrivez votre problème *</Label>
              <Textarea
                id="issue_description"
                value={formData.issue_description}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_description: e.target.value }))}
                placeholder="Décrivez en détail le problème rencontré, quand est-il apparu, dans quelles circonstances..."
                rows={4}
                required
              />
              <p className="text-sm text-muted-foreground">
                Plus votre description est précise, plus le devis sera adapté à votre problème.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Envoi en cours..." : "Envoyer la demande de devis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};