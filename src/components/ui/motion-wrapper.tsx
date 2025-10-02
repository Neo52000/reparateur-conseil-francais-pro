import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Animations présets
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Composant wrapper réutilisable
interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  variant?: "fadeInUp" | "fadeIn" | "scaleIn" | "slideInFromLeft" | "slideInFromRight";
  delay?: number;
  duration?: number;
}

export const MotionWrapper = ({
  children,
  variant = "fadeInUp",
  delay = 0,
  duration = 0.5,
  className,
  ...props
}: MotionWrapperProps) => {
  const variants = {
    fadeInUp,
    fadeIn,
    scaleIn,
    slideInFromLeft,
    slideInFromRight,
  };

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants[variant]}
      transition={{ duration, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Composant de conteneur avec stagger
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
}

export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  className,
  ...props
}: StaggerContainerProps) => {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Composant d'élément stagger
export const StaggerItem = ({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) => {
  return (
    <motion.div
      variants={staggerItem}
      transition={{ duration: 0.5 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Composant de parallax simple
interface ParallaxProps extends HTMLMotionProps<"div"> {
  offset?: number;
}

export const Parallax = ({
  children,
  offset = 50,
  className,
  ...props
}: ParallaxProps) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: -offset }}
      viewport={{ once: false }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
