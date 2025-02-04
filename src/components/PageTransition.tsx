import { motion } from "framer-motion";
import { ReactNode } from "react";

const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      className=""
      initial={{ opacity: 0, y: 20 }} // Initial state (hidden)
      animate={{ opacity: 1, y: 0 }} // Animate to visible
      exit={{ opacity: 0, y: -20 }} // Exit animation
      transition={{ duration: 0.5 }} // Transition duration
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
