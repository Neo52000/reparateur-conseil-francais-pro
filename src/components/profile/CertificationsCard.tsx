
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Building, Shield } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface CertificationsCardProps {
  profile: RepairerProfile;
}

const CertificationsCard: React.FC<CertificationsCardProps> = ({ profile }) => {
  return (
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
  );
};

export default CertificationsCard;
