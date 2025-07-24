"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function TextAnimationTypewriterEffect() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <TypewriterEffect
        words={[
          {
            text: "Build",
            className: "text-black dark:text-white",
          },
          {
            text: "amazing",
            className: "text-black dark:text-white",
          },
          {
            text: "products",
            className: "text-black dark:text-white",
          },
          {
            text: "with",
            className: "text-black dark:text-white",
          },
          {
            text: "Tango.",
            className: "text-blue-500 dark:text-blue-500",
          },
        ]}
      />
    </div>
  );
}

const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const fullText = words.map(word => word.text).join(" ");
    const handleTyping = () => {
      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );
      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, words]);

  return (
    <div className={className}>
      <span className="text-4xl font-bold md:text-7xl">
        {text}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={cursorClassName || "text-blue-500"}
        >
          |
        </motion.span>
      </span>
    </div>
  );
};
