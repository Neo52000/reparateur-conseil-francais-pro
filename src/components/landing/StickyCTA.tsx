import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';

interface StickyCTAProps {
  onGetStarted: () => void;
}

const StickyCTA: React.FC<StickyCTAProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling 500px from top
      const shouldShow = window.scrollY > 500;
      setIsVisible(shouldShow && !isHidden);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHidden]);

  const handleHide = () => {
    setIsHidden(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-electric-blue text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-sm">Prêt à commencer ?</div>
          <div className="text-xs text-electric-blue-light">7 jours d'essai gratuit</div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={onGetStarted}
            size="sm"
            className="bg-vibrant-orange hover:bg-vibrant-orange-dark text-white font-semibold group"
          >
            Démarrer
            <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Button>
          
          <button 
            onClick={handleHide}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;