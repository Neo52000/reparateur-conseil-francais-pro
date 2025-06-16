
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Shield, Calendar, CheckCircle } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface QuickInfoCardProps {
  profile: RepairerProfile;
}

const getResponseTimeLabel = (time: string) => {
  const labels: Record<string, string> = {
    immediate: 'Immédiat',
    '1h': 'Dans l\'heure',
    '2h': '2 heures',
    '24h': '24 heures'
  };
  return labels[time] || time;
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

const QuickInfoCard: React.FC<QuickInfoCardProps> = ({ profile }) => {
  return (
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
  );
};

export default QuickInfoCard;
