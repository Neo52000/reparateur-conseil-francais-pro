import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hook pour détecter si un élément est visible dans le viewport
export const useInView = (threshold = 0.1) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};

// Composant de fade-in au scroll
export const FadeInSection: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const { ref, inView } = useInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Composant de slide-in depuis la droite
export const SlideInFromRight: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const { ref, inView } = useInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Composant de scale-in avec effet de rebond
export const ScaleInBounce: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const { ref, inView } = useInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Composant pour les cartes animées
export const AnimatedCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  hoverScale?: boolean;
  glowOnHover?: boolean;
}> = ({ children, className = '', hoverScale = true, glowOnHover = false }) => {
  return (
    <motion.div
      className={`${className} ${hoverScale ? 'hover-scale' : ''} ${glowOnHover ? 'hover-glow' : ''}`}
      whileHover={hoverScale ? { y: -2 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Composant de confettis pour les célébrations
export const ConfettiAnimation: React.FC<{ 
  show: boolean; 
  onComplete?: () => void;
}> = ({ show, onComplete }) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'];
  
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: colors[i % colors.length],
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
              initial={{ 
                scale: 0,
                rotate: 0,
                y: 0 
              }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: 360,
                y: 200 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              onAnimationComplete={i === 0 ? onComplete : undefined}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// Composant de progression animée
export const AnimatedProgress: React.FC<{ 
  value: number; 
  max?: number;
  showPercentage?: boolean;
  color?: string;
  animate?: boolean;
}> = ({ value, max = 100, showPercentage = true, color = 'primary', animate = true }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-${color} rounded-full`}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <motion.div
          className="text-sm text-muted-foreground text-right"
          initial={animate ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  );
};

// Composant de notification toast animée
export const AnimatedToast: React.FC<{ 
  message: string;
  type?: 'success' | 'error' | 'info';
  show: boolean;
  onClose: () => void;
}> = ({ message, type = 'info', show, onClose }) => {
  const variants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -50, scale: 0.8 }
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary'
  };

  useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50`}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook pour animations staggered (décalées)
export const useStaggeredAnimation = (itemCount: number, delay = 0.1) => {
  return Array.from({ length: itemCount }, (_, i) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * delay, duration: 0.5 }
  }));
};