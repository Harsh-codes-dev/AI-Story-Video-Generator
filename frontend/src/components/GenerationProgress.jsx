"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudioWaveform, BookOpen, Check, Clapperboard, Mountain, Play, Users } from "lucide-react";
import { getJobStatus, PIPELINE_STAGES } from "@/lib/api";

const ICONS = {
  analyzing: BookOpen,
  characters: Users,
  scenes: Mountain,
  voices: AudioWaveform,
  animating: Play,
  video: Clapperboard,
};

const POLL_MS = 800;

export default function GenerationProgress({ jobId, onComplete, onError }) {
  const [stage, setStage] = useState(PIPELINE_STAGES[0].id);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    async function poll() {
      try {
        const job = await getJobStatus(jobId);
        if (cancelled) return;
        if (job.stage) setStage(job.stage);
        if (job.status === "completed") {
          timer = setTimeout(() => !cancelled && onComplete(job), 900);
          return;
        }
        if (job.status === "failed") throw new Error(job.error || "Generation failed.");
        timer = setTimeout(poll, POLL_MS);
      } catch (err) {
        if (!cancelled) onError(err);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, onComplete, onError]);

  const activeIndex = PIPELINE_STAGES.findIndex((s) => s.id === stage);
  const ActiveIcon = ICONS[stage] ?? BookOpen;
  const progress = ((activeIndex + 1) / PIPELINE_STAGES.length) * 100;

  return (
    <div className="flex flex-col items-center px-4 py-10 text-center sm:px-10">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border border-electric/30"
          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          className="absolute inset-3 rounded-full border border-cyan/40"
          animate={{ scale: [1, 1.3], opacity: [0.7, 0] }}
          transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
        />
        <div className="absolute inset-5 rounded-full bg-gradient-to-br from-electric to-cyan shadow-[0_10px_40px_-8px_rgba(37,99,235,0.7)]" />
        <AnimatePresence mode="wait">
          <motion.span
            key={stage}
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative text-white"
          >
            <ActiveIcon size={30} strokeWidth={1.6} />
          </motion.span>
        </AnimatePresence>
      </div>

      <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Creating your world<span className="text-blue-gradient">…</span>
      </h3>

      <div className="mt-2 h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ y: 16, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -16, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35 }}
            className="text-sm text-muted"
          >
            {PIPELINE_STAGES[activeIndex]?.label}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 h-1 w-full max-w-md overflow-hidden rounded-full bg-deep/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-deep via-electric to-cyan"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ol className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-3 sm:grid-cols-6">
        {PIPELINE_STAGES.map((s, i) => {
          const Icon = ICONS[s.id];
          const done = i < activeIndex;
          const current = i === activeIndex;
          return (
            <li key={s.id} className="flex flex-col items-center gap-2">
              <motion.span
                animate={{ scale: current ? 1.1 : 1 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-500 ${
                  done
                    ? "border-electric bg-electric text-white"
                    : current
                      ? "border-electric bg-white text-electric shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                      : "border-deep/15 bg-white/60 text-muted/60"
                }`}
              >
                {done ? <Check size={16} /> : <Icon size={16} strokeWidth={1.8} />}
              </motion.span>
              <span className={`text-[11px] leading-tight ${current ? "text-foreground" : "text-muted"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
