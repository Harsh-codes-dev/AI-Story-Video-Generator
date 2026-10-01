"use client";

import { motion } from "motion/react";
import { Download, Play, RotateCcw } from "lucide-react";

function downloadFileName(prompt) {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  return `${slug || "story"}.mp4`;
}

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
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {job.videoUrl ? (
            <a
              href={job.videoUrl}
              download={downloadFileName(prompt)}
              data-cursor="Download"
              className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-deep"
            >
              <Download size={14} /> Download video
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Available once the AI pipeline generates a real video"
              className="flex cursor-not-allowed items-center gap-2 rounded-full border border-deep/10 px-4 py-2 text-sm text-muted/60"
            >
              <Download size={14} /> Download video
            </button>
          )}
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-full border border-deep/15 px-4 py-2 text-sm text-foreground transition-colors hover:border-electric/40 hover:text-deep"
          >
            <RotateCcw size={14} /> New story
          </button>
        </div>
      </div>
    </motion.div>
  );
}
