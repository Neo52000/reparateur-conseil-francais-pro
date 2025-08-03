import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Hand, 
  Zap, 
  Target,
  Settings,
  Vibrate
} from 'lucide-react';

// Hook pour détecter le type d'appareil
const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [touchSupport, setTouchSupport] = useState(false);

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setTouchSupport(hasTouch);
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return { deviceType, touchSupport };
};

// Hook pour gestes tactiles
const useTouchGestures = (element: React.RefObject<HTMLElement>) => {
  const [gesture, setGesture] = useState<string | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const threshold = 50; // Seuil minimum pour reconnaître un geste

  React.useEffect(() => {
    const el = element.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startPos.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;
      
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setGesture(deltaX > 0 ? 'swipe-right' : 'swipe-left');
        } else {
          setGesture(deltaY > 0 ? 'swipe-down' : 'swipe-up');
        }
        
        // Reset après délai
        setTimeout(() => setGesture(null), 500);
      }
      
      startPos.current = null;
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, threshold]);

  return gesture;
};

// Composant bouton optimisé tactile
const TouchButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, onClick, variant = 'default', size = 'md', className = '' }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    // Vibration tactile si supportée
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const sizeClasses = {
    sm: 'h-12 px-4 text-sm',
    md: 'h-14 px-6 text-base',
    lg: 'h-16 px-8 text-lg'
  };

  const variantClasses = {
    default: 'bg-card hover:bg-accent',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
  };

  return (
    <Button
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isPressed ? 'scale-95 brightness-90' : ''}
        transition-all duration-100 select-none touch-none
        ${className}
      `}
    >
      {children}
    </Button>
  );
};

// Clavier numérique tactile
const TouchNumpad: React.FC<{
  onNumberPress: (num: string) => void;
  onClear: () => void;
  onEnter: () => void;
}> = ({ onNumberPress, onClear, onEnter }) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  return (
    <div className="grid grid-cols-3 gap-3 p-4 bg-card rounded-lg border">
      {numbers.slice(0, 9).map((num) => (
        <TouchButton
          key={num}
          size="lg"
          onClick={() => onNumberPress(num)}
          className="aspect-square"
        >
          {num}
        </TouchButton>
      ))}
      
      <TouchButton size="lg" onClick={onClear} variant="secondary">
        CLR
      </TouchButton>
      
      <TouchButton size="lg" onClick={() => onNumberPress('0')}>
        0
      </TouchButton>
      
      <TouchButton size="lg" onClick={() => onNumberPress('.')} variant="secondary">
        .
      </TouchButton>
      
      <TouchButton 
        size="lg" 
        onClick={onEnter} 
        variant="primary"
        className="col-span-3 mt-2"
      >
        Valider
      </TouchButton>
    </div>
  );
};

// Interface principale tactile
export const TouchOptimizedInterface: React.FC = () => {
  const { deviceType, touchSupport } = useDeviceDetection();
  const containerRef = useRef<HTMLDivElement>(null);
  const gesture = useTouchGestures(containerRef);
  const [currentAmount, setCurrentAmount] = useState('0');
  const [showNumpad, setShowNumpad] = useState(false);

  const handleNumberPress = (num: string) => {
    if (currentAmount === '0') {
      setCurrentAmount(num);
    } else {
      setCurrentAmount(prev => prev + num);
    }
  };

  const handleClear = () => {
    setCurrentAmount('0');
  };

  const handleEnter = () => {
    // Traitement du montant
    console.log('Amount entered:', currentAmount);
    setShowNumpad(false);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header adaptatif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {deviceType === 'mobile' && <Smartphone className="h-5 w-5" />}
            {deviceType === 'tablet' && <Tablet className="h-5 w-5" />}
            {deviceType === 'desktop' && <Monitor className="h-5 w-5" />}
            Interface Tactile Optimisée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant="outline">{deviceType}</Badge>
              <p className="text-xs text-muted-foreground mt-1">Type d'appareil</p>
            </div>
            <div className="text-center">
              <Badge variant={touchSupport ? 'default' : 'secondary'}>
                {touchSupport ? 'Tactile' : 'Souris'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Interaction</p>
            </div>
            <div className="text-center">
              <Badge variant={gesture ? 'default' : 'outline'}>
                {gesture || 'Aucun'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Geste détecté</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary">
                {window.innerWidth}x{window.innerHeight}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Résolution</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saisie de montant optimisée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Saisie Montant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div 
              className="text-4xl font-mono bg-muted p-4 rounded-lg cursor-pointer"
              onClick={() => setShowNumpad(!showNumpad)}
            >
              {currentAmount}€
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Touchez pour ouvrir le clavier
            </p>
          </div>

          {showNumpad && (
            <TouchNumpad
              onNumberPress={handleNumberPress}
              onClear={handleClear}
              onEnter={handleEnter}
            />
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <TouchButton variant="primary" size="lg" onClick={() => {}}>
              <Hand className="h-6 w-6 mr-2" />
              Nouvelle Vente
            </TouchButton>
            <TouchButton variant="secondary" size="lg" onClick={() => {}}>
              <Target className="h-6 w-6 mr-2" />
              Scanner
            </TouchButton>
            <TouchButton variant="default" size="lg" onClick={() => {}}>
              <Settings className="h-6 w-6 mr-2" />
              Paramètres
            </TouchButton>
            <TouchButton variant="default" size="lg" onClick={() => {}}>
              <Vibrate className="h-6 w-6 mr-2" />
              Test Tactile
            </TouchButton>
          </div>
        </CardContent>
      </Card>

      {/* Instructions gestes */}
      <Card>
        <CardHeader>
          <CardTitle>Gestes Supportés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Balayage gauche/droite : Navigation entre onglets</p>
            <p>• Balayage haut : Ouvrir menu actions</p>
            <p>• Balayage bas : Fermer menu/clavier</p>
            <p>• Appui long : Options contextuelles</p>
            <p>• Double tap : Zoom/sélection rapide</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TouchOptimizedInterface;