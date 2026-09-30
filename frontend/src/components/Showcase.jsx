"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Play } from "lucide-react";
import BlurText from "./reactbits/BlurText";
import { AstronautArt, ClockmakerArt, ForestArt } from "./ShowcaseArt";

const STORIES = [
  {
    title: "The Last Astronaut",
    genre: "Sci-Fi",
    body: "Stranded on a silent moon, she follows one final signal into a city no one built.",
    Art: AstronautArt,
  },
  {
    title: "Whispers of the Forest",
    genre: "Fantasy",
    body: "A girl follows a voice only she can hear, deep into woods that remember everything.",
    Art: ForestArt,
  },
  {
    title: "The Clockmaker",
    genre: "Adventure",
    body: "An old inventor builds a machine that can stop time, then forgets how to start it again.",
    Art: ClockmakerArt,
  },
];

function TiltCard({ story, index }) {
  const { title, genre, body, Art } = story;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 180, damping: 20 });

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay: index * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor="View"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative aspect-[3/4] overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(23,78,166,0.55)]"
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
          <Art />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f4d]/85 via-[#174ea6]/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(56,189,248,0.25),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="absolute right-5 top-5 flex h-11 w-11 scale-75 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
          <Play size={16} className="ml-0.5" fill="currentColor" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-6" style={{ transform: "translateZ(40px)" }}>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {genre}
          </span>
          <h3 className="font-display mt-3 text-2xl font-semibold text-white transition-transform duration-500 group-hover:-translate-y-1">
            {title}
          </h3>
          <p className="mt-2 max-h-0 overflow-hidden text-sm text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
            {body}
          </p>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function Showcase() {
  return (
    <section id="showcase" className="relative px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-electric">Watch</span>
        <BlurText
          as="h2"
          text="Worlds already imagined."
          delay={90}
          className="font-display mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl"
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STORIES.map((story, i) => (
            <TiltCard key={story.title} story={story} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
