
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ServicesOfferedCardProps {
  profile: RepairerProfile;
}

const ServicesOfferedCard: React.FC<ServicesOfferedCardProps> = ({ profile }) => {
  if (!profile.services_offered || profile.services_offered.length === 0) {
    return null;
  }

  return (
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
  );
};

export default ServicesOfferedCard;
