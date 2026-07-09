import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedText({ text }) {
  // Split text into words to make the rapid typewriter spacing feel natural
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 } // Speeds up the typing cadence
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 2 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={text} // Forces re-animation when the text string changes
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-xl md:text-2xl font-medium tracking-wide text-center text-emerald-100"
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap mr-2">
            {word.split("").map((char, charIndex) => (
              <motion.span key={charIndex} variants={childVariants} className="inline-block">
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.p>
    </AnimatePresence>
  );
}