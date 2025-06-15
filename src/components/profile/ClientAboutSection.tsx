
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
  Calendar
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientAboutSectionProps {
  profile: RepairerProfile;
}

const ClientAboutSection: React.FC<ClientAboutSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Présentation
              </h3>
              {profile.description ? (
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              ) : (
                <p className="text-gray-500 italic">
                  {profile.business_name} est un réparateur professionnel spécialisé dans la réparation d'appareils électroniques.
                </p>
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
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Temps de réponse</span>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1 text-green-600" />
                    <span className="font-medium text-green-700">Rapide (2h)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Garantie</span>
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 mr-1 text-purple-600" />
                    <span className="font-medium text-purple-700">6 mois</span>
                  </div>
                </div>
                
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
    </div>
  );
};

export default ClientAboutSection;
