import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonHoverProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function ButtonHover({ children, className = "", disabled = false }: ButtonHoverProps) {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CardHoverProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function CardHover({ children, className = "", delay = 0 }: CardHoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: "easeOut",
      }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  direction = "up", 
  className = "" 
}: FadeInProps) {
  const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        ...directionOffset[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}