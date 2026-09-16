import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { DownloadsSection } from "@/components/downloads-section";
import { CommentsSection } from "@/components/comments-section";
import { ContactSection } from "@/components/contact-section";
import { FaqSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";

// Variantes para animação staggered das seções
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  const { user, isLoading } = useAuth();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Navbar />
      </motion.div>
      
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={sectionVariants}>
          <HeroSection />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <FeaturesSection />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <CommentsSection />
        </motion.div>
        {/* Only show Downloads section for authenticated users */}
        {!isLoading && user && (
          <motion.div variants={sectionVariants}>
            <DownloadsSection />
          </motion.div>
        )}
        <motion.div variants={sectionVariants}>
          <ContactSection />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <FaqSection />
        </motion.div>
      </motion.main>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <Footer />
      </motion.div>
    </div>
  );
}