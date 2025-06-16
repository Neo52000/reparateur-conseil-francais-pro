
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Award, 
  Clock, 
  Shield, 
  CheckCircle,
  Building,
  Calendar,
  Home,
  Truck,
  Zap,
  Euro,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientAboutSectionProps {
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

const getWarrantyLabel = (warranty: string) => {
  const labels: Record<string, string> = {
    '3_mois': '3 mois',
    '6_mois': '6 mois',
    '1_an': '1 an',
    '2_ans': '2 ans'
  };
  return labels[warranty] || warranty;
};

const getResponseTimeLabel = (time: string) => {
  const labels: Record<string, string> = {
    immediate: 'Immédiat',
    '1h': 'Dans l\'heure',
    '2h': '2 heures',
    '24h': '24 heures'
  };
  return labels[time] || time;
};

const ClientAboutSection: React.FC<ClientAboutSectionProps> = ({ profile }) => {
  // Fonction pour préserver le formatage SEO dans la description
  const renderDescription = (description: string) => {
    // Séparer les paragraphes et préserver la structure
    const paragraphs = description.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Traiter les titres en gras (format **Titre**)
      if (paragraph.startsWith('**') && paragraph.includes('**')) {
        const titleMatch = paragraph.match(/^\*\*(.*?)\*\*/);
        if (titleMatch) {
          const title = titleMatch[1];
          const content = paragraph.replace(/^\*\*(.*?)\*\*\s*/, '');
          return (
            <div key={index} className="mb-4">
              <h4 className="font-bold text-lg text-gray-900 mb-2">{title}</h4>
              {content && <p className="text-gray-700 leading-relaxed">{content}</p>}
            </div>
          );
        }
      }
      
      // Traiter les listes à puces (format • item)
      if (paragraph.includes('•') || paragraph.includes('- ')) {
        const lines = paragraph.split('\n');
        const listItems = lines.filter(line => line.trim().startsWith('•') || line.trim().startsWith('- '));
        const regularText = lines.filter(line => !line.trim().startsWith('•') && !line.trim().startsWith('- ')).join(' ');
        
        return (
          <div key={index} className="mb-4">
            {regularText && <p className="text-gray-700 leading-relaxed mb-2">{regularText}</p>}
            {listItems.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {listItems.map((item, itemIndex) => (
                  <li key={itemIndex} className="leading-relaxed">
                    {item.replace(/^[•-]\s*/, '')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      
      // Paragraphe normal
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Description avec formatage SEO préservé */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Présentation
              </h3>
              <div className="prose prose-gray max-w-none">
                {profile.description ? (
                  renderDescription(profile.description)
                ) : (
                  <p className="text-gray-500 italic">
                    {profile.business_name} est un réparateur professionnel spécialisé dans la réparation d'appareils électroniques.
                  </p>
                )}
              </div>
              
              {profile.years_experience && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <Award className="h-4 w-4 mr-2 text-orange-600" />
                    <span className="font-medium text-orange-700">
                      {profile.years_experience} années d'expérience
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Informations pratiques
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Localisation</span>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                    <span className="font-medium">{profile.city}</span>
                  </div>
                </div>
                
                {profile.response_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Temps de réponse</span>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-green-600" />
                      <span className="font-medium text-green-700">
                        {getResponseTimeLabel(profile.response_time)}
                      </span>
                    </div>
                  </div>
                )}
                
                {profile.warranty_duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Garantie</span>
                    <div className="flex items-center text-sm">
                      <Shield className="h-4 w-4 mr-1 text-purple-600" />
                      <span className="font-medium text-purple-700">
                        {getWarrantyLabel(profile.warranty_duration)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Créé en</span>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="font-medium">
                      {new Date(profile.created_at).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services Options */}
      {(profile.emergency_service || profile.home_service || profile.pickup_service) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Options de service
            </h3>
            <div className="flex flex-wrap gap-3">
              {profile.emergency_service && (
                <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Service d'urgence
                </Badge>
              )}
              {profile.home_service && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                  <Home className="h-4 w-4 mr-2" />
                  Service à domicile
                </Badge>
              )}
              {profile.pickup_service && (
                <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                  <Truck className="h-4 w-4 mr-2" />
                  Service de collecte
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      {profile.pricing_info && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Euro className="h-5 w-5 mr-2 text-green-600" />
              Informations tarifaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.pricing_info.diagnostic_fee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de diagnostic</span>
                  <span className="font-medium">{profile.pricing_info.diagnostic_fee}€</span>
                </div>
              )}
              {profile.pricing_info.min_repair_cost && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coût minimum</span>
                  <span className="font-medium">À partir de {profile.pricing_info.min_repair_cost}€</span>
                </div>
              )}
              {profile.pricing_info.hourly_rate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarif horaire</span>
                  <span className="font-medium">{profile.pricing_info.hourly_rate}€/h</span>
                </div>
              )}
              {profile.pricing_info.free_quote && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Devis</span>
                  <Badge className="bg-green-100 text-green-800">Gratuit</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages and Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages */}
        {profile.languages_spoken && profile.languages_spoken.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                Langues parlées
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages_spoken.map((lang, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {getLanguageLabel(lang)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods */}
        {profile.payment_methods && profile.payment_methods.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
                Moyens de paiement
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.payment_methods.map((method, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {getPaymentMethodLabel(method)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Certifications and Labels */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Certifications et labels
          </h3>
          <div className="flex flex-wrap gap-3">
            {profile.has_qualirepar_label && (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                Label QualiRépar
              </Badge>
            )}
            {profile.certifications && profile.certifications.map((cert, index) => (
              <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                {cert}
              </Badge>
            ))}
            {profile.siret_number && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                <Building className="h-4 w-4 mr-2" />
                Entreprise déclarée
              </Badge>
            )}
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Profil vérifié
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Services Offered */}
      {profile.services_offered && profile.services_offered.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Services proposés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {profile.services_offered.map((service, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientAboutSection;
