"use client";

import { motion } from "motion/react";
import GradientText from "./reactbits/GradientText";

const EASE = [0.16, 1, 0.3, 1];

function Line({ children, delay, className = "" }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "105%", opacity: 0, filter: "blur(12px)", scale: 0.98 }}
        animate={{ y: "0%", opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ delay, duration: 1.1, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function AnimatedHeadline({ baseDelay = 0.5 }) {
  return (
    <h1 className="font-display text-[clamp(2.4rem,8.6vw,4.2rem)] leading-[0.98] tracking-[-0.04em] text-foreground lg:text-[clamp(3.5rem,5vw,5.25rem)]">
      <Line delay={baseDelay} className="font-light">
        Your Vision.
      </Line>
      <Line delay={baseDelay + 0.14} className="text-blue-gradient font-semibold">
        Your World.
      </Line>
      <Line delay={baseDelay + 0.28} className="font-medium">
        Bring It To Life.
      </Line>
      <Line delay={baseDelay + 0.42} className="font-medium">
        <GradientText
          colors={["#174ea6", "#2563eb", "#38bdf8", "#2563eb"]}
          animationSpeed={6}
          className="font-extrabold"
        >
          Watch it Unfold.
        </GradientText>
      </Line>
    </h1>
  );
}
