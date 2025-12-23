import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  FileText, 
  MapPin, 
  Star, 
  Clock, 
  Calendar,
  Award,
  CheckCircle,
  Globe,
  MessageCircle,
  CreditCard,
  Languages,
  Image
} from 'lucide-react';
import { getRepairTypeLabel, PAYMENT_METHODS, LANGUAGES } from '@/types/repairerProfile';

interface ProfilePremiumViewProps {
  profile: any;
  onRequestQuote: () => void;
  onCallRepairer: () => void;
  onBookAppointment: () => void;
}

const ProfilePremiumView: React.FC<ProfilePremiumViewProps> = ({
  profile,
  onRequestQuote,
  onCallRepairer,
  onBookAppointment
}) => {
  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Infos principales */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {/* Photo de profil */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/5">
                  {profile.profile_image_url ? (
                    <img 
                      src={profile.profile_image_url} 
                      alt={profile.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {profile.business_name?.charAt(0)?.toUpperCase() || 'R'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-foreground break-words">
                      {profile.business_name}
                    </h1>
                    <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.address}, {profile.city}</span>
                    </div>
                    
                    {profile.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-foreground">{profile.rating}/5</span>
                        {profile.review_count && (
                          <span className="text-muted-foreground">({profile.review_count} avis)</span>
                        )}
                      </div>
                    )}
                    
                    {profile.response_time && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Clock className="h-4 w-4" />
                        <span>Répond en {profile.response_time}</span>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-2">
                    {(profile.repair_types || []).map((type: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {getRepairTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:min-w-[220px]">
              <Button 
                onClick={onBookAppointment}
                className="w-full"
                size="lg"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Prendre RDV en ligne
              </Button>
              
              <Button 
                onClick={onRequestQuote}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Demander un devis
              </Button>
              
              <Button 
                onClick={onCallRepairer}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Phone className="h-4 w-4 mr-2" />
                {profile.phone || 'Appeler'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {profile.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">À propos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {profile.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Galerie photos */}
      {profile.shop_photos && profile.shop_photos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-5 w-5" />
              Photos de l'atelier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.shop_photos.map((photo: string, index: number) => (
                <div 
                  key={index} 
                  className="aspect-video rounded-lg overflow-hidden bg-muted"
                >
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services et tarifs */}
      {(profile.services_offered?.length > 0 || profile.pricing_info) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Services & Tarifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Services */}
              {profile.services_offered?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-foreground">Services proposés</h4>
                  <div className="space-y-2">
                    {profile.services_offered.map((service: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarifs */}
              {profile.pricing_info && (
                <div>
                  <h4 className="font-medium mb-3 text-foreground">Tarifs indicatifs</h4>
                  <div className="space-y-2 text-sm">
                    {profile.pricing_info.diagnostic_fee !== undefined && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Diagnostic</span>
                        <span className="font-medium">
                          {profile.pricing_info.diagnostic_fee === 0 
                            ? 'Gratuit' 
                            : `${profile.pricing_info.diagnostic_fee} €`}
                        </span>
                      </div>
                    )}
                    {profile.pricing_info.min_repair_cost && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Réparation à partir de</span>
                        <span className="font-medium">{profile.pricing_info.min_repair_cost} €</span>
                      </div>
                    )}
                    {profile.pricing_info.hourly_rate && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span>Taux horaire</span>
                        <span className="font-medium">{profile.pricing_info.hourly_rate} €/h</span>
                      </div>
                    )}
                    {profile.pricing_info.free_quote && (
                      <Badge variant="secondary" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Devis gratuit
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications et garantie */}
      {(profile.certifications?.length > 0 || profile.warranty_duration) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5" />
              Certifications & Garanties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {profile.certifications?.map((cert: string, index: number) => (
                <Badge key={index} variant="secondary" className="py-2 px-4">
                  <Award className="h-4 w-4 mr-2" />
                  {cert}
                </Badge>
              ))}
              {profile.warranty_duration && (
                <Badge variant="outline" className="py-2 px-4 border-green-200 bg-green-50 text-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Garantie {profile.warranty_duration}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options et infos pratiques */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Langues */}
        {profile.languages_spoken?.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Languages className="h-5 w-5" />
                Langues parlées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.languages_spoken.map((lang: string, index: number) => {
                  const langLabel = LANGUAGES.find(l => l.value === lang)?.label || lang;
                  return (
                    <Badge key={index} variant="outline">
                      {langLabel}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Moyens de paiement */}
        {profile.payment_methods?.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Moyens de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.payment_methods.map((method: string, index: number) => {
                  const methodLabel = PAYMENT_METHODS.find(m => m.value === method)?.label || method;
                  return (
                    <Badge key={index} variant="outline">
                      {methodLabel}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Options de service */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Options de service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {profile.home_service && (
              <Badge variant="secondary" className="py-2 px-4">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Intervention à domicile
              </Badge>
            )}
            {profile.pickup_service && (
              <Badge variant="secondary" className="py-2 px-4">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Service de collecte
              </Badge>
            )}
            {profile.emergency_service && (
              <Badge variant="secondary" className="py-2 px-4">
                <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                Urgences acceptées
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePremiumView;
