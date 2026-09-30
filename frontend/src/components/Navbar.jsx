"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "./Logo";

// `id` links are sections on the homepage itself and use scroll-spy;
// plain page links are active purely based on the current route.
const LINKS = [
  { label: "Home", href: "/", id: "hero" },
  { label: "Create", href: "/create" },
  { label: "How It Works", href: "/how-it-works" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [scrollActive, setScrollActive] = useState("hero");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    const sectionIds = LINKS.filter((l) => l.id).map((l) => l.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setScrollActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  function isActive(link) {
    if (link.id) return pathname === "/" && scrollActive === link.id;
    return pathname === link.href;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-5"
    >
      <div
        className={`relative mx-auto flex max-w-6xl items-center rounded-full px-5 py-2.5 transition-all duration-500 ${
          scrolled ? "glass shadow-[0_8px_30px_-12px_rgba(23,78,166,0.25)]" : "border border-transparent"
        }`}
      >
        <Link href="/" aria-label="AI Video Generator home">
          <Logo />
        </Link>

        {/* Centered on the bar itself (not the remaining flex space), so an
            unequal-width logo on the left doesn't pull it off-center. */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-full px-4 py-2 text-base font-medium transition-colors duration-300 ${
                isActive(link) ? "text-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {link.label}
              {isActive(link) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-electric to-cyan"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <button
          className="ml-auto rounded-full p-2 text-foreground md:hidden"
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
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-foreground hover:bg-ice"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/create"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white"
            >
              Create Story <ArrowRight size={15} />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
