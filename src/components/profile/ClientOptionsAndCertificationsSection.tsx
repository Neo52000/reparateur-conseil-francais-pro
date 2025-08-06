
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Home, 
  Truck, 
  Award, 
  Building, 
  Shield 
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientOptionsAndCertificationsSectionProps {
  profile: RepairerProfile;
}

const ClientOptionsAndCertificationsSection: React.FC<ClientOptionsAndCertificationsSectionProps> = ({ profile }) => {
  const hasServiceOptions = profile.emergency_service || profile.home_service || profile.pickup_service;
  const hasCertifications = profile.has_qualirepar_label || (profile.certifications && profile.certifications.length > 0) || profile.siret_number;

  if (!hasServiceOptions && !hasCertifications) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Options et certifications</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options de service */}
        {hasServiceOptions && (
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

        {/* Certifications et labels */}
        {hasCertifications && (
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
        )}
      </div>
    </div>
  );
};

export default ClientOptionsAndCertificationsSection;
