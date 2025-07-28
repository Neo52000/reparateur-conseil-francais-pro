import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Building, Shield, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EnhancedClaimBannerProps {
  businessName: string;
  className?: string;
}

const EnhancedClaimBanner: React.FC<EnhancedClaimBannerProps> = ({ 
  businessName, 
  className = "" 
}) => {
  return (
    <Card className={`border-orange-200 bg-gradient-to-br from-orange-50 to-blue-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Icon section */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          {/* Content section */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Vous êtes le propriétaire de <span className="text-orange-600">{businessName}</span> ?
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Cette fiche a été créée automatiquement. Revendiquez-la pour bénéficier de fonctionnalités 
              premium et contrôler les informations affichées à vos clients.
            </p>
            
            {/* Benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Informations vérifiées</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-600" />
                <span>Gestion des avis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="h-4 w-4 text-blue-600" />
                <span>Visibilité améliorée</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              ✨ Plans à partir de 9,90€/mois • Sans engagement • Essai gratuit 14 jours
            </div>
          </div>
          
          {/* CTA section */}
          <div className="flex-shrink-0">
            <Link to="/repairer/auth">
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-sm font-semibold whitespace-nowrap shadow-lg"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Revendiquer ma fiche
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedClaimBanner;