"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import Magnet from "./reactbits/Magnet";

const LINKS = [
  { label: "Home", id: "hero" },
  { label: "Create", id: "create" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Showcase", id: "showcase" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-5"
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${
          scrolled ? "glass shadow-[0_8px_30px_-12px_rgba(23,78,166,0.25)]" : "border border-transparent"
        }`}
      >
        <a href="#hero" className="font-display text-sm font-bold tracking-[0.28em] text-foreground">
          AI Video Generator
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                active === id ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
              {active === id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-electric to-cyan"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Magnet padding={40} magnetStrength={4}>
            <a
              href="#create"
              data-cursor="Go"
              className="group flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-colors duration-300 hover:bg-deep"
            >
              Create Story
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Magnet>
        </div>

        <button
          className="rounded-full p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass mx-auto mt-3 flex max-w-6xl flex-col gap-1 rounded-3xl p-4 md:hidden"
          >
            {LINKS.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-foreground hover:bg-ice"
              >
                {label}
              </a>
            ))}
            <a
              href="#create"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white"
            >
              Create Story <ArrowRight size={15} />
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
