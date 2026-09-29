const LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Create", href: "#create" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Showcase", href: "#showcase" },
];

export default function Footer() {
  return (
    <footer className="relative px-6 pb-10 pt-24">
      <div className="mx-auto max-w-6xl">
        <p className="font-display max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
          Every world starts
          <br />
          <span className="text-blue-gradient">with a sentence.</span>
        </p>
        <a
          href="#create"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-deep"
        >
          Write yours →
        </a>

        <div className="mt-20 flex flex-col gap-6 border-t border-deep/10 pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-xs font-bold tracking-[0.28em] text-foreground">KRINJAL</span>
          <nav className="flex flex-wrap gap-6">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
          <span>© {new Date().getFullYear()} Krinjal · AI story-to-animated-video</span>
        </div>
      </div>
    </footer>
  );
}
