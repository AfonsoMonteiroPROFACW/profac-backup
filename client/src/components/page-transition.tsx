import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Variantes de animação para entrada/saída das páginas
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

// Transições suaves
const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente específico para páginas modais/overlays
export function ModalTransition({ children, className = "" }: PageTransitionProps) {
  const modalVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: 10,
    },
    in: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      scale: 0.95,
      y: 10,
    },
  };

  const modalTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={modalVariants}
      transition={modalTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente para animações de fade simples
export function FadeTransition({ children, className = "" }: PageTransitionProps) {
  const fadeVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const fadeTransition = {
    duration: 0.3,
    ease: "easeInOut",
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={fadeVariants}
      transition={fadeTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}