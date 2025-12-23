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
  Shield,
  Lock,
  Eye,
  Image,
  DollarSign,
  Award
} from 'lucide-react';
import { getRepairTypeLabel } from '@/types/repairerProfile';

interface ProfileBasicViewProps {
  profile: any;
  onRequestQuote: () => void;
  onCallRepairer: () => void;
}

const ProfileBasicView: React.FC<ProfileBasicViewProps> = ({
  profile,
  onRequestQuote,
  onCallRepairer
}) => {
  // Masquer partiellement le téléphone
  const maskedPhone = profile.phone 
    ? profile.phone.substring(0, 4) + ' XX XX XX XX'
    : '07 XX XX XX XX';

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Infos principales */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {/* Avatar placeholder */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-primary">
                    {profile.business_name?.charAt(0)?.toUpperCase() || 'R'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground mb-2 break-words">
                    {profile.business_name}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.city} ({profile.postal_code})</span>
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
                  </div>

                  {/* Services détectés */}
                  <div className="flex flex-wrap gap-2">
                    {(profile.repair_types || []).slice(0, 4).map((type: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {getRepairTypeLabel(type)}
                      </Badge>
                    ))}
                    {profile.repair_types?.length > 4 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        +{profile.repair_types.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:min-w-[200px]">
              <Button 
                onClick={onRequestQuote}
                className="w-full"
                size="lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Demander un devis
              </Button>
              
              <Button 
                onClick={onCallRepairer}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations limitées */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-muted-foreground" />
            Informations disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Localisation partielle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Localisation</p>
                  <p className="text-sm text-muted-foreground">{profile.city} ({profile.postal_code})</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">Visible</Badge>
            </div>

            {/* Téléphone partiel */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">Téléphone</p>
                  <p className="text-sm text-muted-foreground">{maskedPhone}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Partiel
              </Badge>
            </div>

            {/* Adresse exacte - masquée */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Adresse exacte</p>
                  <p className="text-sm text-muted-foreground">●●●●●●●●●●●●●●●●●●●●</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50">
                <Lock className="h-3 w-3 mr-1" />
                Masquée
              </Badge>
            </div>

            {/* Horaires - masqués */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Horaires détaillés</p>
                  <p className="text-sm text-muted-foreground">●● : ●● - ●● : ●●</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50">
                <Lock className="h-3 w-3 mr-1" />
                Masqués
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections floutées */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Galerie photos - floutée */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-5 w-5" />
              Galerie photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg blur-sm"
                />
              ))}
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-4">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium text-foreground">Photos masquées</p>
                <p className="text-sm text-muted-foreground">Fiche non revendiquée</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarifs - floutés */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Tarifs indicatifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Écran iPhone', 'Batterie Samsung', 'Connecteur charge'].map((item, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-2 bg-muted rounded blur-sm"
                >
                  <span>{item}</span>
                  <span>XX €</span>
                </div>
              ))}
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-4">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium text-foreground">Tarifs masqués</p>
                <p className="text-sm text-muted-foreground">Fiche non revendiquée</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message d'information */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Fiche non encore revendiquée
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Ce réparateur n'a pas encore validé sa fiche sur TopRéparateurs. 
                Les informations affichées proviennent de sources publiques.
                Vous pouvez tout de même demander un devis ou appeler directement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileBasicView;
