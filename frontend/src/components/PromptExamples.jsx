"use client";

import { motion } from "motion/react";

const EXAMPLES = [
  "A girl discovers a magical forest.",
  "An astronaut finds a lost city on Mars.",
  "An inventor builds a machine that stops time.",
  "A lonely robot befriends a lighthouse keeper.",
];

export default function PromptExamples({ onSelect }) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2.5">
      <span className="w-full text-center text-[11px] uppercase tracking-[0.22em] text-muted/80">Try one</span>
      {EXAMPLES.map((example, i) => (
        <motion.button
          key={example}
          type="button"
          onClick={() => onSelect(example)}
          data-cursor="Use"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
          whileHover={{ y: -2 }}
          className="glass rounded-full px-4 py-2 text-sm text-muted transition-colors duration-300 hover:border-electric/40 hover:text-deep"
        >
          {example}
        </motion.button>
      ))}
    </div>
  );
}
