
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail } from 'lucide-react';

const SocialShareSection: React.FC = () => {
  const shareUrl = window.location.href;
  const shareText = "Découvrez la plateforme qui aide les réparateurs à développer leur activité ! 🚀";

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/33745062162?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'email':
        url = `mailto:contact@topreparateurs.fr?subject=${encodeURIComponent('Découvrez cette plateforme pour réparateurs')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      default:
        // Fallback vers l'API Web Share si disponible
        if (navigator.share) {
          navigator.share({
            title: 'Plateforme pour réparateurs',
            text: shareText,
            url: shareUrl,
          });
          return;
        }
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="py-12 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Share2 className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">
                Partagez avec vos collègues
              </h3>
            </div>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Vous connaissez d'autres réparateurs qui pourraient bénéficier de notre plateforme ? 
              Partagez cette page et aidez-les à développer leur activité !
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button
                onClick={() => handleShare('facebook')}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Facebook className="h-5 w-5 mr-2" />
                Facebook
              </Button>
              
              <Button
                onClick={() => handleShare('twitter')}
                className="bg-sky-500 hover:bg-sky-600"
                size="lg"
              >
                <Twitter className="h-5 w-5 mr-2" />
                Twitter
              </Button>
              
              <Button
                onClick={() => handleShare('linkedin')}
                className="bg-blue-700 hover:bg-blue-800"
                size="lg"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn
              </Button>
              
              <Button
                onClick={() => handleShare('whatsapp')}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                onClick={() => handleShare('email')}
                variant="outline"
                size="lg"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email
              </Button>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-green-800">
                <strong>💰 Programme de parrainage :</strong> Gagnez 1 mois gratuit 
                pour chaque réparateur que vous parrainez !
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialShareSection;
