"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#fff6dd", "#ffe9b0", "#ffd88a", "#fffdf5", "#ffffff"];

function spawn() {
  const angle = Math.random() * Math.PI * 2;
  // Fast enough to visibly clear the image's own footprint and disperse
  // into the surrounding space within one lifetime, not just drift inside it.
  const speed = 20 + Math.random() * 34; // px/sec, radial drift outward
  return {
    angle,
    speed,
    dist: Math.random() * 20,
    life: 0,
    maxLife: 6 + Math.random() * 4, // seconds
    r: 1.3 + Math.random() * 2.2,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    wobble: Math.random() * Math.PI * 2,
  };
}

/**
 * Golden-white particles that continuously drift outward from the center in
 * all directions, slowly, fading in/out — meant to sit behind a hero image.
 */
export default function ImageParticles({ className = "", count = 46 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    let last = performance.now();

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      particles = Array.from({ length: count }, () => spawn(width / 2, height / 2));
    }

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.min(width, height) * 0.62;

      for (const p of particles) {
        p.life += dt;
        p.dist += p.speed * dt;
        p.wobble += dt * 0.6;

        if (p.life > p.maxLife || p.dist > maxDist) {
          Object.assign(p, spawn(cx, cy));
          continue;
        }

        const t = p.life / p.maxLife;
        const fade = t < 0.15 ? t / 0.15 : t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
        const wob = Math.sin(p.wobble) * 3;
        const x = cx + Math.cos(p.angle) * p.dist + Math.cos(p.angle + Math.PI / 2) * wob;
        const y = cy + Math.sin(p.angle) * p.dist + Math.sin(p.angle + Math.PI / 2) * wob;

        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(fade, 0) * 0.95;
        ctx.shadowColor = "#ffcf6b";
        ctx.shadowBlur = 7;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      frame = requestAnimationFrame(tick);
    }

    init();
    // Window resize alone misses layout shifts caused by async content (e.g.
    // the hero image finishing its own sizing), so also watch the element.
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [count]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
