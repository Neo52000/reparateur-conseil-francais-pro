import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Shield, Eye } from 'lucide-react';

interface SimplifiedProfileActionsProps {
  profile: any;
}

const SimplifiedProfileActions: React.FC<SimplifiedProfileActionsProps> = ({
  profile
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Informations limitées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Adresse exacte</span>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Masquée
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Horaires détaillés</span>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Masqués
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Certifications</span>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Masquées
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <Shield className="h-4 w-4 inline mr-1" />
            Ce réparateur n'a pas encore revendiqué sa fiche
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedProfileActions;