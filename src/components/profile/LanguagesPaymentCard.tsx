
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CreditCard } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface LanguagesPaymentCardProps {
  profile: RepairerProfile;
}

const getLanguageLabel = (lang: string) => {
  const labels: Record<string, string> = {
    francais: 'Français',
    anglais: 'Anglais',
    espagnol: 'Espagnol',
    italien: 'Italien',
    allemand: 'Allemand',
    arabe: 'Arabe'
  };
  return labels[lang] || lang;
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    especes: 'Espèces',
    carte: 'Carte bancaire',
    cheque: 'Chèque',
    virement: 'Virement',
    paypal: 'PayPal'
  };
  return labels[method] || method;
};

const LanguagesPaymentCard: React.FC<LanguagesPaymentCardProps> = ({ profile }) => {
  const hasLanguages = profile.languages_spoken && profile.languages_spoken.length > 0;
  const hasPaymentMethods = profile.payment_methods && profile.payment_methods.length > 0;

  if (!hasLanguages && !hasPaymentMethods) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Languages */}
      {hasLanguages && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
              Langues parlées
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages_spoken!.map((lang, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {getLanguageLabel(lang)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      {hasPaymentMethods && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
              Moyens de paiement
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.payment_methods!.map((method, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {getPaymentMethodLabel(method)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LanguagesPaymentCard;
