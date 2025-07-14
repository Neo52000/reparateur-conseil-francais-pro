import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionalAvatarProps {
  emotion?: 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'empathetic';
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const EmotionalAvatar: React.FC<EmotionalAvatarProps> = ({ 
  emotion = 'neutral', 
  isTyping = false,
  size = 'md' 
}) => {
  const [currentExpression, setCurrentExpression] = useState(emotion);
  const [isBlinking, setIsBlinking] = useState(false);

  // Simulation du clignement naturel
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    setCurrentExpression(emotion);
  }, [emotion]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const getAvatarElements = () => {
    const baseElements = {
      face: "bg-gradient-to-br from-pink-100 to-pink-200",
      eyes: isBlinking ? "h-0.5" : "h-2",
      mouth: "w-4 h-2 bg-pink-600 rounded-full"
    };

    switch (currentExpression) {
      case 'happy':
        return {
          ...baseElements,
          face: "bg-gradient-to-br from-yellow-100 to-yellow-200",
          mouth: "w-4 h-2 bg-yellow-600 rounded-full"
        };
      case 'thinking':
        return {
          ...baseElements,
          face: "bg-gradient-to-br from-blue-100 to-blue-200",
          mouth: "w-3 h-1 bg-blue-600 rounded-full"
        };
      case 'concerned':
        return {
          ...baseElements,
          face: "bg-gradient-to-br from-orange-100 to-orange-200",
          mouth: "w-3 h-1 bg-orange-600 rounded-full transform rotate-180"
        };
      case 'excited':
        return {
          ...baseElements,
          face: "bg-gradient-to-br from-purple-100 to-purple-200",
          mouth: "w-5 h-3 bg-purple-600 rounded-full"
        };
      case 'empathetic':
        return {
          ...baseElements,
          face: "bg-gradient-to-br from-green-100 to-green-200",
          mouth: "w-4 h-1.5 bg-green-600 rounded-full"
        };
      default:
        return baseElements;
    }
  };

  const elements = getAvatarElements();

  return (
    <div className="relative">
      <motion.div
        className={`${sizeClasses[size]} ${elements.face} rounded-full border-2 border-white shadow-sm relative overflow-hidden`}
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
        {/* Yeux */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2">
          <motion.div 
            className={`w-1.5 ${elements.eyes} bg-gray-700 rounded-full`}
            animate={{ scaleY: isBlinking ? 0 : 1 }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="absolute top-1/3 right-1/4 transform translate-x-1/2">
          <motion.div 
            className={`w-1.5 ${elements.eyes} bg-gray-700 rounded-full`}
            animate={{ scaleY: isBlinking ? 0 : 1 }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Bouche */}
        <motion.div
          className={`absolute bottom-1/3 left-1/2 transform -translate-x-1/2 ${elements.mouth}`}
          animate={{
            scaleY: isTyping ? [1, 0.5, 1] : 1,
          }}
          transition={{
            repeat: isTyping ? Infinity : 0,
            duration: 0.8,
            ease: "easeInOut"
          }}
        />

        {/* Effet de brillance */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 to-transparent rounded-full"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Indicateur d'état */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Particules d'émotion pour l'état excité */}
      <AnimatePresence>
        {currentExpression === 'excited' && (
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
      </AnimatePresence>
    </div>
  );
};

export default EmotionalAvatar;