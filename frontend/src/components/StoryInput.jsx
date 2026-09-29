"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";
import BlurText from "./reactbits/BlurText";
import PromptExamples from "./PromptExamples";
import GenerationProgress from "./GenerationProgress";
import StoryResult from "./StoryResult";
import { generateStory } from "@/lib/api";

const MAX_CHARS = 1000;

// Lets the fixed background react ("the AI is listening") without coupling
// the two components: HeroBackground styles itself off these attributes.
function setAtmosphere(state) {
  if (state) document.documentElement.dataset.atmosphere = state;
  else delete document.documentElement.dataset.atmosphere;
}

export default function StoryInput() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | submitting | generating | done
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (phase === "generating") setAtmosphere("generating");
    else if (focused) setAtmosphere("listening");
    else setAtmosphere(null);
  }, [phase, focused]);

  useEffect(() => () => setAtmosphere(null), []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Tell us a little about your story first.");
      textareaRef.current?.focus();
      return;
    }
    setError(null);
    setPhase("submitting");
    try {
      const started = await generateStory(prompt.trim());
      setJob(started);
      setPhase("generating");
    } catch (err) {
      setError(err.message || "Couldn't reach the generation service.");
      setPhase("idle");
    }
  }

  const handleComplete = useCallback((finished) => {
    setJob(finished);
    setPhase("done");
  }, []);

  const handleError = useCallback((err) => {
    setError(err.message || "Generation failed. Please try again.");
    setPhase("idle");
  }, []);

  function reset() {
    setPhase("idle");
    setJob(null);
    setPrompt("");
  }

  function selectExample(text) {
    setPrompt(text);
    setError(null);
    textareaRef.current?.focus();
  }

  return (
    <section id="create" className="relative px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-electric">02 — Describe</span>
        <BlurText
          as="h2"
          text="Tell us your story."
          delay={90}
          className="font-display mt-4 justify-center text-4xl font-semibold tracking-[-0.03em] sm:text-6xl"
        />
        <p className="mx-auto mt-4 max-w-md text-muted">Describe the world you want to bring to life.</p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <div className="relative">
          {/* Animated gradient border: visible on focus and while generating. */}
          <motion.div
            aria-hidden
            className="absolute -inset-px rounded-[1.75rem] bg-[linear-gradient(110deg,#174ea6,#3b82f6,#38bdf8,#8cc8ff,#3b82f6,#174ea6)] bg-[length:300%_100%]"
            animate={{
              opacity: focused || phase !== "idle" ? 1 : 0,
              backgroundPosition: ["0% 50%", "100% 50%"],
            }}
            transition={{
              opacity: { duration: 0.5 },
              backgroundPosition: { duration: 6, repeat: Infinity, repeatType: "reverse", ease: "linear" },
            }}
          />
          <div className="relative overflow-hidden rounded-[1.75rem] bg-white/70 shadow-[0_30px_80px_-30px_rgba(23,78,166,0.35)] backdrop-blur-2xl">
            <AnimatePresence mode="wait">
              {phase === "generating" && job ? (
                <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GenerationProgress jobId={job.jobId} onComplete={handleComplete} onError={handleError} />
                </motion.div>
              ) : phase === "done" && job ? (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <StoryResult job={job} prompt={prompt} onReset={reset} />
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  className="flex flex-col"
                >
                  <label htmlFor="story-prompt" className="px-7 pt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-deep/70">
                    Your story
                  </label>
                  <textarea
                    id="story-prompt"
                    ref={textareaRef}
                    value={prompt}
                    maxLength={MAX_CHARS}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Once upon a time…"
                    rows={6}
                    className="min-h-[180px] w-full resize-y bg-transparent px-7 pb-4 pt-3 text-lg leading-relaxed text-foreground placeholder:text-muted/50 focus:outline-none sm:text-xl"
                  />
                  <div className="flex flex-col-reverse gap-4 border-t border-deep/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="text-xs text-muted" aria-live="polite">
                      {error ? <span className="text-red-500">{error}</span> : `${prompt.length} / ${MAX_CHARS}`}
                    </p>
                    <button
                      type="submit"
                      disabled={phase === "submitting"}
                      data-cursor="Create"
                      className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_-10px_rgba(37,99,235,0.7)] transition-transform duration-300 hover:scale-[1.03] disabled:opacity-70"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-deep via-electric to-cyan opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      {phase === "submitting" ? (
                        <Loader2 size={16} className="relative animate-spin" />
                      ) : (
                        <>
                          <span className="relative">Bring It To Life</span>
                          <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {phase === "idle" && <PromptExamples onSelect={selectExample} />}
      </div>
    </section>
  );
}
