"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { isFinePointer } from "@/lib/device";

const subscribe = () => () => {};
const getSnapshot = () => isFinePointer();
const getServerSnapshot = () => false;

// A small dot that grows (optionally with a label) over elements marked with
// data-cursor, plus a soft blue glow that trails behind it with damping.
export default function CursorEffect() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dotRef = useRef(null);
  const glowRef = useRef(null);
  const [label, setLabel] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("custom-cursor-active");

    const target = { x: -200, y: -200 };
    const dot = { x: -200, y: -200 };
    const glow = { x: -200, y: -200 };
    let frame = 0;

    function updateLabel() {
      const hit = document.elementFromPoint(target.x, target.y);
      const el = hit?.closest?.("[data-cursor]");
      setLabel(el ? el.dataset.cursor : null);
    }

    function onMove(e) {
      target.x = e.clientX;
      target.y = e.clientY;
      updateLabel();
    }

    // The element under a still cursor changes on scroll and after clicks
    // that swap content, so re-check then too.
    function onSettle() {
      requestAnimationFrame(updateLabel);
    }

    function tick() {
      dot.x += (target.x - dot.x) * 0.35;
      dot.y += (target.y - dot.y) * 0.35;
      glow.x += (target.x - glow.x) * 0.08;
      glow.y += (target.y - glow.y) * 0.08;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${glow.x}px, ${glow.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onSettle, { passive: true });
    window.addEventListener("click", onSettle);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onSettle);
      window.removeEventListener("click", onSettle);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  const expanded = label !== null;

  return (
    <>
      <div ref={glowRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[5]">
        <div className="-ml-[160px] -mt-[160px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),rgba(56,189,248,0.06)_45%,transparent_70%)] blur-xl" />
      </div>
      <div ref={dotRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100]">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[width,height,background-color] duration-300 ease-out ${
            expanded
              ? "h-16 w-16 bg-electric/90 backdrop-blur-sm"
              : "h-2.5 w-2.5 bg-foreground"
          }`}
        >
          {expanded && label && (
            <span className="font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
              {label}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
