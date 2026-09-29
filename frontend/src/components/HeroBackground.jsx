"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { isFinePointer, prefersReducedMotion, supportsWebGL } from "@/lib/device";
import FloatingParticles from "./FloatingParticles";

const ColorBends = dynamic(() => import("./reactbits/ColorBends"), { ssr: false });
const LiquidEther = dynamic(() => import("./reactbits/LiquidEther"), { ssr: false });

// "none" | "lite" (mobile / reduced motion) | "full" (desktop with a mouse)
let cachedTier = null;
function getTier() {
  if (cachedTier) return cachedTier;
  if (!supportsWebGL()) cachedTier = "none";
  else if (!isFinePointer() || prefersReducedMotion() || window.innerWidth < 768) cachedTier = "lite";
  else cachedTier = "full";
  return cachedTier;
}
const subscribe = () => () => {};
const getServerTier = () => "none";

// Color Bends sums overlapping band colors, so two saturated blues give
// royal blue on single bands and sky blue where they overlap.
const BAND_COLORS = ["#174ea6", "#3b82f6"];
const FLUID_COLORS = ["#eaf4ff", "#8cc8ff", "#2563eb"];

export default function HeroBackground() {
  const tier = useSyncExternalStore(subscribe, getTier, getServerTier);
  const { scrollYProgress } = useScroll();

  // The same atmosphere deepens as the story progresses down the page.
  const deepen = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0, 0.18, 0.4, 0.3]);
  const bandsOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.75, 0.65]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="atmosphere-fallback absolute inset-0" />

      {tier !== "none" && (
        <motion.div className="absolute inset-0" style={{ opacity: bandsOpacity }}>
          <ColorBends
            colors={BAND_COLORS}
            rotation={28}
            speed={tier === "full" ? 0.14 : 0.1}
            scale={1.15}
            frequency={1}
            warpStrength={1}
            mouseInfluence={tier === "full" ? 0.7 : 0}
            parallax={0.08}
            noise={0.06}
            iterations={1}
            intensity={1}
            bandWidth={5}
            transparent
          />
        </motion.div>
      )}

      {tier === "full" && (
        <div className="absolute inset-0 opacity-55">
          <LiquidEther
            colors={FLUID_COLORS}
            mouseForce={16}
            cursorSize={110}
            resolution={0.4}
            iterationsPoisson={16}
            iterationsViscous={16}
            autoDemo={false}
          />
        </div>
      )}

      <motion.div
        className="absolute inset-0"
        style={{
          opacity: deepen,
          background:
            "radial-gradient(90% 70% at 50% 60%, rgba(37,99,235,0.35), rgba(23,78,166,0.15) 60%, transparent 85%)",
        }}
      />

      {/* Driven by html[data-atmosphere], set by StoryInput. */}
      <div className="atmo-listening absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_55%,rgba(56,189,248,0.22),rgba(255,255,255,0.35)_55%,transparent_80%)]" />
      <div className="atmo-generating absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_55%,rgba(37,99,235,0.3),rgba(23,78,166,0.12)_55%,transparent_85%)]" />

      {tier !== "none" && <FloatingParticles count={tier === "full" ? 36 : 14} />}

      {/* Soft white veil keeps foreground text readable over the brightest bands. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_32%_50%,rgba(248,251,255,0.6),transparent_75%)]" />
    </div>
  );
}
