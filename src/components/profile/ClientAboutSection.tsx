
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Award, MapPin, Briefcase } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';
import DescriptionRenderer from './DescriptionRenderer';

interface ClientAboutSectionProps {
  profile: RepairerProfile;
}

const ClientAboutSection: React.FC<ClientAboutSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description principale */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-600" />
              Présentation
            </h3>
            {profile.description ? (
              <DescriptionRenderer description={profile.description} />
            ) : (
              <p className="text-gray-500 italic">
                {profile.business_name} est un réparateur professionnel spécialisé dans la réparation d'appareils électroniques.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Informations générales */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
              Informations générales
            </h3>
            <div className="space-y-4">
              {/* Nom commercial */}
              <div>
                <span className="text-sm font-medium text-gray-600">Nom commercial</span>
                <p className="text-gray-900">{profile.business_name}</p>
              </div>

              {/* SIRET */}
              {profile.siret_number && (
                <div>
                  <span className="text-sm font-medium text-gray-600">N° SIRET</span>
                  <p className="text-gray-900">{profile.siret_number}</p>
                </div>
              )}

              {/* Années d'expérience */}
              {profile.years_experience && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Expérience</span>
                  <div className="flex items-center text-orange-700">
                    <Award className="h-4 w-4 mr-1" />
                    <span className="font-medium">{profile.years_experience} années</span>
                  </div>
                </div>
              )}

              {/* Adresse */}
              <div>
                <span className="text-sm font-medium text-gray-600">Adresse</span>
                <div className="flex items-start text-gray-700">
                  <MapPin className="h-4 w-4 mr-1 mt-1 flex-shrink-0" />
                  <div>
                    <p>{profile.address}</p>
                    <p>{profile.postal_code} {profile.city}</p>
                  </div>
                </div>
              </div>

              {/* Label QualiRépar si présent */}
              {profile.has_qualirepar_label && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Label qualité</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <img 
                      src="https://www.label-qualirepar.fr/wp-content/uploads/2022/06/logo-label-quali-repar-300x169-1.png" 
                      alt="Label Qualirépar" 
                      className="h-6 w-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientAboutSection;
