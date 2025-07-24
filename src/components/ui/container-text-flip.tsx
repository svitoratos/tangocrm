"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const ContainerTextFlip = ({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{words[0]}</span>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <span className="text-2xl font-bold">{words[1] || words[0]}</span>
        </div>
      </motion.div>
    </div>
  );
};
