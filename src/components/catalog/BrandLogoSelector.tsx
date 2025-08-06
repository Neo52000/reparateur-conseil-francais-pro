
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrandLogoPreview from './BrandLogoPreview';
import { Check, ExternalLink } from 'lucide-react';

interface BrandLogoSelectorProps {
  brandName: string;
  logoUrl: string;
  onLogoChange: (logoUrl: string) => void;
}

// Base de données de logos prédéfinis pour les marques populaires
const PREDEFINED_LOGOS = [
  {
    name: 'Apple',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    keywords: ['apple', 'iphone', 'ipad', 'mac']
  },
  {
    name: 'Samsung',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    keywords: ['samsung', 'galaxy']
  },
  {
    name: 'Huawei',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Huawei_Standard_logo.svg',
    keywords: ['huawei']
  },
  {
    name: 'Xiaomi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg',
    keywords: ['xiaomi', 'mi', 'redmi']
  },
  {
    name: 'OnePlus',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OnePlus_logo.svg',
    keywords: ['oneplus', 'one plus']
  },
  {
    name: 'Google',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    keywords: ['google', 'pixel']
  },
  {
    name: 'Sony',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    keywords: ['sony', 'xperia']
  },
  {
    name: 'LG',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/20/LG_symbol.svg',
    keywords: ['lg']
  },
  {
    name: 'Oppo',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/OPPO_LOGO_2019.svg',
    keywords: ['oppo']
  },
  {
    name: 'Vivo',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Vivo_Logo.svg',
    keywords: ['vivo']
  }
];

const BrandLogoSelector: React.FC<BrandLogoSelectorProps> = ({
  brandName,
  logoUrl,
  onLogoChange
}) => {
  const [customUrl, setCustomUrl] = useState(logoUrl);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Rechercher des logos suggérés basés sur le nom de la marque
  const suggestedLogos = PREDEFINED_LOGOS.filter(logo => 
    logo.keywords.some(keyword => 
      brandName.toLowerCase().includes(keyword) || 
      keyword.includes(brandName.toLowerCase())
    )
  );

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url);
    onLogoChange(url);
  };

  const handlePredefinedSelect = (url: string) => {
    setCustomUrl(url);
    onLogoChange(url);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="logo_url">URL du logo</Label>
        <div className="flex space-x-2 mt-1">
          <Input
            id="logo_url"
            type="url"
            value={customUrl}
            onChange={(e) => handleCustomUrlChange(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          {customUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(customUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Formats recommandés: PNG, SVG ou JPG. Taille optimale: 200x200px
        </p>
      </div>

      {/* Prévisualisation du logo */}
      <div className="flex items-center space-x-3">
        <Label>Aperçu:</Label>
        <BrandLogoPreview logoUrl={customUrl} brandName={brandName} size="lg" />
      </div>

      {/* Logos suggérés */}
      {suggestedLogos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Logos suggérés pour "{brandName}"</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
          
          {showSuggestions && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {suggestedLogos.map((logo) => (
                <Card 
                  key={logo.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    customUrl === logo.url ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePredefinedSelect(logo.url)}
                >
                  <CardContent className="p-3 flex flex-col items-center space-y-2">
                    <BrandLogoPreview 
                      logoUrl={logo.url} 
                      brandName={logo.name} 
                      size="md" 
                    />
                    <Badge variant="secondary" className="text-xs">
                      {logo.name}
                    </Badge>
                    {customUrl === logo.url && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Logos populaires */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Logos populaires</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            Parcourir
          </Button>
        </div>
        
        {showSuggestions && suggestedLogos.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PREDEFINED_LOGOS.slice(0, 10).map((logo) => (
              <Card 
                key={logo.name}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  customUrl === logo.url ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handlePredefinedSelect(logo.url)}
              >
                <CardContent className="p-3 flex flex-col items-center space-y-2">
                  <BrandLogoPreview 
                    logoUrl={logo.url} 
                    brandName={logo.name} 
                    size="sm" 
                  />
                  <Badge variant="outline" className="text-xs">
                    {logo.name}
                  </Badge>
                  {customUrl === logo.url && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogoSelector;
