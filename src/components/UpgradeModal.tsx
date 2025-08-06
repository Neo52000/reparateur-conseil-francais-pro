
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Crown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, userEmail }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dismissing, setDismissing] = useState(false);

  const handleViewPlans = () => {
    onClose();
    navigate('/repairer/plans');
  };

  const handleRemindLater = async () => {
    setDismissing(true);
    try {
      // Programmer un rappel dans 7 jours
      const remindDate = new Date();
      remindDate.setDate(remindDate.getDate() + 7);

      const { error } = await supabase
        .from('repairer_subscriptions')
        .update({ popup_dismissed_until: remindDate.toISOString() })
        .eq('email', userEmail);

      if (error) throw error;

      toast({
        title: "Rappel programmé",
        description: "Nous vous rappellerons dans 7 jours",
      });
      onClose();
    } catch (error) {
      console.error('Error setting reminder:', error);
    } finally {
      setDismissing(false);
    }
  };

  const handleNeverShow = async () => {
    setDismissing(true);
    try {
      const { error } = await supabase
        .from('repairer_subscriptions')
        .update({ popup_never_show: true })
        .eq('email', userEmail);

      if (error) throw error;

      onClose();
    } catch (error) {
      console.error('Error dismissing popup:', error);
    } finally {
      setDismissing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Développez votre activité !
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Vous êtes actuellement sur le plan Gratuit
              </h3>
              <p className="text-blue-100">
                Passez à un plan payant pour accéder à plus de fonctionnalités et développer votre clientèle
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">Plan Basique</h4>
              <p className="text-sm text-gray-600 mb-2">Parfait pour débuter</p>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                À partir de 19,90€/mois
              </Badge>
            </div>

            <div className="border-2 border-purple-200 rounded-lg p-4 text-center bg-purple-50">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold">Plan Premium</h4>
              <p className="text-sm text-gray-600 mb-2">Le plus populaire</p>
              <Badge className="bg-purple-600 text-white">
                À partir de 39,90€/mois
              </Badge>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-semibold">Plan Enterprise</h4>
              <p className="text-sm text-gray-600 mb-2">Solution complète</p>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                À partir de 79,90€/mois
              </Badge>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button onClick={handleViewPlans} className="w-full">
              Voir tous les plans et fonctionnalités
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRemindLater}
                disabled={dismissing}
                className="flex-1"
              >
                Rappeler dans 7 jours
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleNeverShow}
                disabled={dismissing}
                className="flex-1 text-gray-500"
              >
                Ne plus afficher
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
