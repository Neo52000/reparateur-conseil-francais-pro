
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const SimplifiedBlurredSections: React.FC = () => {
  return (
    <>
      {/* Services bloutés */}
      <div className="relative">
        <div className="filter blur-sm pointer-events-none select-none">
          <Card className="opacity-60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Services proposés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg p-4 h-24"></div>
                <div className="bg-gray-100 rounded-lg p-4 h-24"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Contenu masqué</p>
            <p className="text-gray-500 text-sm">Revendiquez cette fiche pour voir plus</p>
          </div>
        </div>
      </div>

      {/* Horaires bloutés */}
      <div className="relative">
        <div className="filter blur-sm pointer-events-none select-none">
          <Card className="opacity-60">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Horaires d'ouverture</h3>
              <div className="space-y-2">
                <div className="bg-gray-100 rounded h-6"></div>
                <div className="bg-gray-100 rounded h-6"></div>
                <div className="bg-gray-100 rounded h-6"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Horaires masqués</p>
            <p className="text-gray-500 text-sm">Appelez pour connaître les horaires</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimplifiedBlurredSections;
