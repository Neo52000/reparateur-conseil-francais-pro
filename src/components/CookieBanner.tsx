
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const savePreferences = (preferences: { necessary: boolean; analytics: boolean; marketing: boolean }) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      ...preferences,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg border-2">
        <CardContent className="p-6">
          {!showSettings ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Gestion des cookies</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                    réaliser des statistiques et vous proposer des contenus adaptés.
                  </p>
                  <p className="text-xs text-gray-500">
                    En continuant votre navigation, vous acceptez l'utilisation de cookies. 
                    Consultez notre{' '}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      politique de confidentialité
                    </Link>{' '}
                    pour plus d'informations.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                >
                  Nécessaires uniquement
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Accepter tout
                </Button>
              </div>
            </div>
          ) : (
            <CookieSettings 
              onSave={savePreferences} 
              onClose={() => setShowSettings(false)} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface CookieSettingsProps {
  onSave: (preferences: { necessary: boolean; analytics: boolean; marketing: boolean }) => void;
  onClose: () => void;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ onSave, onClose }) => {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Paramètres des cookies</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Cookies nécessaires</h4>
            <p className="text-sm text-gray-600">
              Indispensables au fonctionnement du site
            </p>
          </div>
          <div className="text-green-600 font-medium">Toujours actifs</div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Cookies analytiques</h4>
            <p className="text-sm text-gray-600">
              Nous aident à comprendre comment vous utilisez le site
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
              className="sr-only"
            />
            <div className={`w-11 h-6 bg-gray-200 rounded-full p-1 duration-300 ease-in-out ${preferences.analytics ? 'bg-blue-600' : ''}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${preferences.analytics ? 'translate-x-5' : ''}`}></div>
            </div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Cookies marketing</h4>
            <p className="text-sm text-gray-600">
              Utilisés pour personnaliser les publicités
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
              className="sr-only"
            />
            <div className={`w-11 h-6 bg-gray-200 rounded-full p-1 duration-300 ease-in-out ${preferences.marketing ? 'bg-blue-600' : ''}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${preferences.marketing ? 'translate-x-5' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
          Enregistrer les préférences
        </Button>
      </div>
    </div>
  );
};

export default CookieBanner;
