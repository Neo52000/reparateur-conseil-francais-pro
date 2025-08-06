import { useEffect } from 'react';

// Gestionnaire de sons pour l'interface POS
class POSSoundManager {
  private static instance: POSSoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  private constructor() {
    this.initializeSounds();
  }

  static getInstance(): POSSoundManager {
    if (!POSSoundManager.instance) {
      POSSoundManager.instance = new POSSoundManager();
    }
    return POSSoundManager.instance;
  }

  private initializeSounds() {
    // Sons en base64 pour éviter les dépendances externes
    const sounds = {
      // Bip d'ajout au panier (courte note haute)
      addToCart: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+HyvmMcBDWH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OGYTwwOUarm7blgGgU7k9n0unYrBSF1xe/eizEHHmq+8OScTQ==',
      
      // Son de validation de paiement (double bip)
      paymentSuccess: 'data:audio/wav;base64,UklGRqQEAABXQVZFZm10IBAAAAABAAEAKhYAAFQsAAACABAAZGF0YQoFAACwuLjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=',
      
      // Erreur (son grave)
      error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+HyvmMcBDWH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OGYTwwOUarm7blgGgU7k9n0unYrBSF1xe/eizEHHmq+8OScTQ==',
      
      // Ouverture de session
      sessionOpen: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+HyvmMcBDWH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OGYTwwOUarm7blgGgU7k9n0unYrBSF1xe/eizEHHmq+8OScTQ==',
      
      // Notification douce
      notification: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+HyvmMcBDWH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OGYTwwOUarm7blgGgU7k9n0unYrBSF1xe/eizEHHmq+8OScTQ=='
    };

    Object.entries(sounds).forEach(([name, dataUrl]) => {
      const audio = new Audio(dataUrl);
      audio.volume = 0.3; // Volume modéré par défaut
      this.sounds.set(name, audio);
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.sounds.forEach(audio => {
      audio.volume = Math.max(0, Math.min(1, volume));
    });
  }

  play(soundName: string, volume?: number) {
    if (!this.enabled) return;

    const audio = this.sounds.get(soundName);
    if (audio) {
      if (volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, volume));
      }
      
      // Arrêter le son s'il est déjà en cours
      audio.currentTime = 0;
      
      // Jouer le son avec gestion d'erreur silencieuse
      audio.play().catch(() => {
        // Ignorer les erreurs de lecture (autoplay policy, etc.)
      });
    }
  }

  // Sons spécifiques pour le POS
  playAddToCart() {
    this.play('addToCart', 0.4);
  }

  playPaymentSuccess() {
    this.play('paymentSuccess', 0.6);
  }

  playError() {
    this.play('error', 0.5);
  }

  playSessionOpen() {
    this.play('sessionOpen', 0.4);
  }

  playNotification() {
    this.play('notification', 0.3);
  }
}

// Hook pour utiliser le gestionnaire de sons
export const usePOSSounds = () => {
  const soundManager = POSSoundManager.getInstance();

  useEffect(() => {
    // Précharger les sons au montage du composant
    return () => {
      // Cleanup si nécessaire
    };
  }, []);

  return {
    playAddToCart: () => soundManager.playAddToCart(),
    playPaymentSuccess: () => soundManager.playPaymentSuccess(),
    playError: () => soundManager.playError(),
    playSessionOpen: () => soundManager.playSessionOpen(),
    playNotification: () => soundManager.playNotification(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume)
  };
};

// Composant pour les préférences sonores
interface SoundPreferencesProps {
  enabled: boolean;
  volume: number;
  onEnabledChange: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
}

export const SoundPreferences: React.FC<SoundPreferencesProps> = ({
  enabled,
  volume,
  onEnabledChange,
  onVolumeChange
}) => {
  const sounds = usePOSSounds();

  const handleVolumeChange = (newVolume: number) => {
    onVolumeChange(newVolume);
    sounds.setVolume(newVolume);
  };

  const handleEnabledChange = (newEnabled: boolean) => {
    onEnabledChange(newEnabled);
    sounds.setEnabled(newEnabled);
    if (newEnabled) {
      sounds.playNotification(); // Test du son
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Sons activés</label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => handleEnabledChange(e.target.checked)}
          className="rounded"
        />
      </div>
      
      {enabled && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default POSSoundManager;