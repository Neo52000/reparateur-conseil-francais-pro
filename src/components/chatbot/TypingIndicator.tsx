import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isVisible, 
  message = "Ben réfléchit..." 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border max-w-xs"
    >
      {/* Dots animation */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Message */}
      <motion.span 
        className="text-sm text-gray-600 italic"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }}
      >
        {message}
      </motion.span>
    </motion.div>
  );
};

export default TypingIndicator;