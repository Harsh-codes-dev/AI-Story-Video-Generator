"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { AudioWaveform, Clapperboard, Mountain, PenLine, Sparkles, Users } from "lucide-react";
import SpotlightCard from "./reactbits/SpotlightCard";
import BlurText from "./reactbits/BlurText";

const STEPS = [
  { icon: PenLine, title: "Story", body: "Write your idea in a sentence or a full script." },
  { icon: Users, title: "Characters", body: "AI understands who is in your story, how they look and how they sound." },
  { icon: Mountain, title: "Scenes", body: "AI builds the world: locations, objects, lighting and timeline." },
  { icon: AudioWaveform, title: "Voices", body: "Every character receives a consistent voice across scenes." },
  { icon: Sparkles, title: "Animation", body: "Scenes come alive with motion, camera and emotion." },
  { icon: Clapperboard, title: "Video", body: "Watch your story as a finished animated video." },
];

export default function HowItWorks() {
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="how-it-works" className="relative px-6 py-32 sm:py-40">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-36">
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-electric">Create</span>
            <BlurText
              as="h2"
              text="From words to worlds."
              delay={90}
              className="font-display mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl"
            />
            <p className="mt-6 max-w-sm text-muted">
              One prompt goes in. Behind the scenes, the AI reads your story the way a director would,
              then builds it scene by scene.
            </p>
          </div>
        </div>

        <div ref={listRef} className="relative lg:col-span-7">
          <div className="absolute bottom-6 left-[27px] top-6 w-px bg-deep/10" aria-hidden />
          <motion.div
            aria-hidden
            className="absolute left-[27px] top-6 w-px origin-top bg-gradient-to-b from-electric via-cyan to-electric"
            style={{ scaleY: fill, bottom: "1.5rem" }}
          />

          <ol className="flex flex-col gap-5">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-6"
              >
                <span className="relative z-10 mt-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-electric/20 bg-white text-electric shadow-[0_8px_24px_-10px_rgba(37,99,235,0.5)]">
                  <Icon size={22} strokeWidth={1.6} />
                </span>
                <SpotlightCard className="flex-1 p-6! sm:p-7!">
                  <span className="font-display text-sm font-medium text-electric">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-1 text-2xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-muted">{body}</p>
                </SpotlightCard>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
