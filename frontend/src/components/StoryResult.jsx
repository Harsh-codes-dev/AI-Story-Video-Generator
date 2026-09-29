"use client";

import { motion } from "motion/react";
import { Play, RotateCcw } from "lucide-react";

export default function StoryResult({ job, prompt, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="p-3 sm:p-4"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-deep via-electric to-cyan">
        {job.videoUrl ? (
          <video src={job.videoUrl} controls className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_20%,rgba(255,255,255,0.35),transparent_70%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              <span data-cursor="Play" className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <Play size={26} className="ml-1" fill="currentColor" />
              </span>
              <p className="max-w-sm px-6 text-center text-sm text-white/80">
                Your animated video will play here once the AI pipeline is connected.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 px-2 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-[0.22em] text-electric">World generated</span>
          <p className="mt-1 line-clamp-2 max-w-lg text-sm text-muted">“{prompt}”</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 self-start rounded-full border border-deep/15 px-4 py-2 text-sm text-foreground transition-colors hover:border-electric/40 hover:text-deep sm:self-auto"
        >
          <RotateCcw size={14} /> New story
        </button>
      </div>
    </motion.div>
  );
}
