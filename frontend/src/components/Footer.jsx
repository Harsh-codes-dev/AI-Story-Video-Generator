"use client";

import { AudioWaveform, Lightbulb, Mountain, Play, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import BlurText from "./reactbits/BlurText";

const STEPS = [
  { icon: Lightbulb, label: "A simple idea" },
  { icon: Users, label: "Unforgettable characters" },
  { icon: Mountain, label: "Immersive scenes" },
  { icon: AudioWaveform, label: "Lifelike voices" },
  { icon: Play, label: "A world in motion" },
];

function StepChip({ step, i, isLast }) {
  const Icon = step.icon;
  // True alternation: even index hugs the left edge, odd index the right.
  const align = i % 2 === 0 ? "self-start" : "self-end";
  return (
    <motion.div
      initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex w-fit items-center gap-3 rounded-full py-2.5 pl-2.5 pr-5 ${align} ${
        isLast ? "bg-electric/10 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.4)]" : "glass"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isLast ? "bg-electric text-white" : "bg-ice text-electric"
        }`}
      >
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <span className="text-sm font-medium text-foreground">{step.label}</span>
      <span className="ml-2 text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
      {isLast && (
        <motion.span
          aria-hidden
          className="absolute -right-2 -top-2 text-cyan"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={16} />
        </motion.span>
      )}
    </motion.div>
  );
}

export default function Footer() {
  return (
    <footer id="begin" className="relative px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <BlurText
              as="h2"
              text="Your story is"
              delay={80}
              className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl"
            />
            <BlurText
              as="h2"
              text="only the beginning."
              delay={80}
              startDelay={0.4}
              className="text-blue-gradient font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl"
            />
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              Turn a simple idea into a living, breathing world with characters, scenes,
              voices, and motion, all in one place, powered by AI.
            </p>
            <Link
              href="/create"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_-10px_rgba(37,99,235,0.6)] transition-transform duration-300 hover:scale-[1.03]"
            >
              Write Your Story
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="relative py-2">
            <svg
              viewBox="0 0 320 380"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              fill="none"
              aria-hidden
            >
              <motion.path
                d="M40 30 Q140 60 90 110 Q40 160 150 190 Q260 220 110 260 Q0 300 190 330"
                stroke="url(#footer-trail)"
                strokeWidth="1.4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <defs>
                <linearGradient id="footer-trail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8cc8ff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <circle cx="270" cy="34" r="14" stroke="#8cc8ff" strokeWidth="1" opacity="0.7" />
              <circle cx="270" cy="34" r="6" fill="#3b82f6" opacity="0.8" />
            </svg>

            <div className="relative flex flex-col gap-6">
              {STEPS.map((step, i) => (
                <StepChip key={step.label} step={step} i={i} isLast={i === STEPS.length - 1} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-deep/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-5 w-9 items-center rounded-full border border-deep/15 bg-white">
              <span className="ml-0.5 h-3.5 w-3.5 rounded-full bg-electric" />
            </span>
            <span className="flex items-center gap-2 uppercase tracking-[0.2em]">
              Idea <span aria-hidden>→</span> Story <span aria-hidden>→</span> World{" "}
              <span aria-hidden>→</span> Motion
            </span>
          </div>
          <span className="uppercase tracking-[0.2em]">Your imagination. Real worlds.</span>
        </div>
      </div>
    </footer>
  );
}
