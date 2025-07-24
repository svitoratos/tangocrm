"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function TextAnimationFlippingWords() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="text-center text-4xl font-bold tracking-tight text-black dark:text-white md:text-7xl">
        Build
        <FlipWords words={["better", "faster", "smarter", "stronger"]} /> <br />
        products with Tango
      </div>
    </div>
  );
}

const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        const currentIndex = words.indexOf(currentWord);
        const nextIndex = (currentIndex + 1) % words.length;
        setCurrentWord(words[nextIndex]);
        setIsAnimating(false);
      }, 500);
    }, duration);

    return () => clearInterval(interval);
  }, [currentWord, duration, words]);

  return (
    <motion.div
      animate={{
        rotateX: isAnimating ? [0, -90, 0] : 0,
        opacity: isAnimating ? [1, 0, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      className={`relative inline-block px-2 ${className}`}
    >
      {currentWord}
    </motion.div>
  );
};
