import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';

interface SimplifiedQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  isPremium: boolean;
}

const SimplifiedQuoteModal: React.FC<SimplifiedQuoteModalProps> = ({
  isOpen, onClose, profile, isPremium
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    deviceType: '',
    brand: '',
    issue: '',
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('quotes_with_timeline').insert({
        repairer_id: profile.id,
        device_brand: formData.brand,
        device_model: formData.deviceType,
        repair_type: formData.deviceType,
        issue_description: formData.issue,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        status: 'pending'
      });

      if (error) throw error;

      setSuccess(true);
      toast({ title: 'Demande envoyée !', description: 'Vous recevrez une réponse sous 24h.' });
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ deviceType: '', brand: '', issue: '', name: '', email: '', phone: '' });
      }, 2000);
    } catch (error) {
      console.error('Quote error:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Demande envoyée !</h3>
            <p className="text-muted-foreground">Vous recevrez une réponse sous 24h par email.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Demander un devis gratuit</DialogTitle>
          <DialogDescription>
            Décrivez votre problème et recevez un devis de {profile.business_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deviceType">Type d'appareil</Label>
              <Select value={formData.deviceType} onValueChange={(v) => setFormData({...formData, deviceType: v})}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="tablette">Tablette</SelectItem>
                  <SelectItem value="ordinateur">Ordinateur</SelectItem>
                  <SelectItem value="console">Console</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="brand">Marque</Label>
              <Input 
                placeholder="Ex: iPhone, Samsung..." 
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="issue">Décrivez le problème</Label>
            <Textarea 
              placeholder="Écran cassé, batterie qui ne tient plus, etc."
              value={formData.issue}
              onChange={(e) => setFormData({...formData, issue: e.target.value})}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Votre nom</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Envoyer ma demande
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedQuoteModal;
