import React from 'react';
import { motion } from 'framer-motion';

interface BenAvatarProps {
  emotion?: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'empathetic';
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BenAvatar: React.FC<BenAvatarProps> = ({ 
  emotion = 'happy', 
  isTyping = false,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const getEmotionFilter = () => {
    switch (emotion) {
      case 'happy':
        return 'brightness(1.1) saturate(1.2)';
      case 'thinking':
        return 'brightness(0.9) sepia(0.2)';
      case 'concerned':
        return 'brightness(0.8) saturate(0.8)';
      case 'excited':
        return 'brightness(1.2) saturate(1.3) hue-rotate(10deg)';
      case 'empathetic':
        return 'brightness(0.95) saturate(0.9) hue-rotate(-10deg)';
      default:
        return 'brightness(1)';
    }
  };

  return (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm relative`}
        animate={{
          scale: isTyping ? [1, 1.05, 1] : 1,
        }}
        transition={{
          scale: {
            repeat: isTyping ? Infinity : 0,
            duration: 1.5,
            ease: "easeInOut"
          }
        }}
      >
        <motion.img
          src="/lovable-uploads/164a3771-b3c7-4352-b20e-1dce63910ff3.png"
          alt="Ben - Assistant IA"
          className="w-full h-full object-cover"
          style={{
            filter: getEmotionFilter(),
          }}
          animate={{
            filter: [getEmotionFilter(), getEmotionFilter()],
          }}
          transition={{
            duration: 0.3,
          }}
        />
        
        {/* Overlay d'émotion */}
        <motion.div
          className={`absolute inset-0 rounded-full ${
            emotion === 'thinking' ? 'bg-blue-500/10' :
            emotion === 'concerned' ? 'bg-orange-500/10' :
            emotion === 'excited' ? 'bg-yellow-500/10' :
            emotion === 'empathetic' ? 'bg-green-500/10' :
            'bg-transparent'
          }`}
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            repeat: isTyping ? Infinity : 0,
            duration: 2,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Indicateur d'état */}
      {isTyping && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"
        >
          <motion.div
            className="w-full h-full bg-blue-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}

      {/* Particules d'émotion pour l'état excité */}
      {emotion === 'excited' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                scale: 0, 
                opacity: 0,
                x: 0,
                y: 0 
              }}
              animate={{ 
                scale: [0, 1, 0], 
                opacity: [0, 1, 0],
                x: (Math.random() - 0.5) * 40,
                y: (Math.random() - 0.5) * 40 
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: i * 0.3,
                ease: "easeOut"
              }}
              className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full"
            />
          ))}
        </>
      )}
    </div>
  );
};

export default BenAvatar;