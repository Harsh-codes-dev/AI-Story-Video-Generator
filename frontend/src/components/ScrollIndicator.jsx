"use client";

import { motion } from "motion/react";

export default function ScrollIndicator({ delay = 2 }) {
  return (
    <motion.a
      href="/create"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.9 }}
      className="group flex flex-col items-center gap-3"
    >
      <span className="text-center text-[10px] font-medium uppercase leading-[1.8] tracking-[0.32em] text-muted transition-colors group-hover:text-foreground">
        Your imagination
        <br />
        is the only input
      </span>
      <span className="relative h-12 w-px overflow-hidden bg-deep/15">
        <motion.span
          className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-transparent via-electric to-transparent"
          animate={{ y: ["-110%", "260%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      </span>
    </motion.a>
  );
}
