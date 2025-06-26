
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, UserX, Download } from 'lucide-react';

const PrivacyNotice: React.FC = () => {
  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Protection de vos données personnelles
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Transparence totale</h4>
                    <p className="text-sm text-gray-600">
                      Nous collectons uniquement les données nécessaires au fonctionnement de notre service 
                      et vous informons clairement de leur utilisation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <UserX className="h-5 w-5 text-red-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Désabonnement facile</h4>
                    <p className="text-sm text-gray-600">
                      Vous pouvez vous désabonner de nos communications marketing à tout moment 
                      en un seul clic depuis nos emails.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Sécurité renforcée</h4>
                    <p className="text-sm text-gray-600">
                      Vos données sont chiffrées et stockées de manière sécurisée. 
                      Nous respectons scrupuleusement le RGPD.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Download className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Vos droits</h4>
                    <p className="text-sm text-gray-600">
                      Accès, rectification, suppression, portabilité : 
                      exercez tous vos droits sur vos données personnelles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-3">
                <strong>Utilisation des données :</strong> Les informations recueillies sont utilisées pour vous contacter, 
                vous proposer nos services et améliorer votre expérience. Elles ne sont jamais vendues à des tiers.
              </p>
              
              <div className="flex flex-wrap gap-4 text-xs">
                <a href="/privacy-policy" className="text-blue-600 hover:underline">
                  📋 Politique de confidentialité complète
                </a>
                <a href="/terms" className="text-blue-600 hover:underline">
                  📜 Conditions générales d'utilisation
                </a>
                <a href="/contact" className="text-blue-600 hover:underline">
                  📧 Contactez notre DPO
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyNotice;
