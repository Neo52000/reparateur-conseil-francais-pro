
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Award } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';
import DescriptionRenderer from './DescriptionRenderer';
import ServiceOptionsCard from './ServiceOptionsCard';
import PricingInfoCard from './PricingInfoCard';
import LanguagesPaymentCard from './LanguagesPaymentCard';
import CertificationsCard from './CertificationsCard';
import ServicesOfferedCard from './ServicesOfferedCard';
import ClientPhotosSection from './ClientPhotosSection';

interface ClientAboutSectionProps {
  profile: RepairerProfile;
}

const ClientAboutSection: React.FC<ClientAboutSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description avec formatage SEO préservé */}
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
      </div>

      {/* Photos de l'atelier */}
      <ClientPhotosSection profile={profile} />

      {/* Services Options */}
      <ServiceOptionsCard profile={profile} />

      {/* Pricing Information */}
      <PricingInfoCard profile={profile} />

      {/* Languages and Payment */}
      <LanguagesPaymentCard profile={profile} />

      {/* Certifications and Labels */}
      <CertificationsCard profile={profile} />

      {/* Services Offered */}
      <ServicesOfferedCard profile={profile} />
    </div>
  );
};

export default ClientAboutSection;
