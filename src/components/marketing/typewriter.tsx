"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  words: string[];
  delay?: number;
  pause?: number;
  className?: string;
}

export function Typewriter({
  words,
  delay = 50,
  pause = 1200,
  className = "",
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const type = () => {
      const fullWord = words[currentWordIndex];

      if (isDeleting) {
        // Deleting
        setCurrentText((prev) => prev.slice(0, -1));
        
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          timeout = setTimeout(type, 200); // Small pause before starting new word
          return;
        }
        
        timeout = setTimeout(type, delay / 2);
      } else {
        // Typing
        setCurrentText(fullWord.slice(0, currentText.length + 1));

        if (currentText === fullWord) {
          setIsDeleting(false); // We want to pause at full word
          timeout = setTimeout(() => setIsDeleting(true), pause);
          return;
        }

        timeout = setTimeout(type, delay);
      }
    };

    timeout = setTimeout(type, delay);

    return () => clearTimeout(timeout);
  }, [currentText, currentWordIndex, isDeleting, words, delay, pause]);

  return (
    <span className={`${className} inline-flex items-baseline`}>
      <span className="font-pixel text-white font-normal select-none">
        {currentText}
      </span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        className="inline-block ml-1 text-white align-baseline font-pixel"
      >
        |
      </motion.span>
    </span>
  );
}
