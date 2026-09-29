// Vector key-art placeholders for the showcase cards, drawn to match the
// light-blue identity rather than using stock imagery.

export function AstronautArt() {
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" fill="none">
      <rect width="300" height="400" fill="url(#as-sky)" />
      <defs>
        <linearGradient id="as-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f2f6b" />
          <stop offset="0.6" stopColor="#2563eb" />
          <stop offset="1" stopColor="#8cc8ff" />
        </linearGradient>
      </defs>
      <circle cx="220" cy="90" r="46" fill="#cfe5ff" opacity="0.9" />
      <circle cx="206" cy="80" r="8" fill="#8cc8ff" opacity="0.6" />
      <circle cx="232" cy="104" r="5" fill="#8cc8ff" opacity="0.6" />
      {[[40, 60], [90, 30], [140, 70], [60, 140], [260, 170], [20, 200]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="#ffffff" opacity="0.8" />
      ))}
      <path d="M0 300 L40 250 L60 270 L90 220 L110 240 L110 300 Z" fill="#174ea6" opacity="0.7" />
      <path d="M180 300 L200 230 L215 245 L235 200 L260 260 L300 240 L300 300 Z" fill="#174ea6" opacity="0.7" />
      <path d="M0 330 Q150 290 300 330 L300 400 L0 400 Z" fill="#eaf4ff" />
      <g transform="translate(140 262)">
        <circle cx="10" cy="0" r="9" fill="#ffffff" />
        <rect x="4" y="-4" width="12" height="6" rx="3" fill="#38bdf8" />
        <rect x="1" y="9" width="18" height="24" rx="6" fill="#ffffff" />
        <rect x="3" y="33" width="6" height="14" rx="3" fill="#ffffff" />
        <rect x="11" y="33" width="6" height="14" rx="3" fill="#ffffff" />
      </g>
    </svg>
  );
}

export function ForestArt() {
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" fill="none">
      <defs>
        <linearGradient id="fo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eaf4ff" />
          <stop offset="1" stopColor="#8cc8ff" />
        </linearGradient>
        <radialGradient id="fo-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#fo-sky)" />
      <circle cx="150" cy="210" r="90" fill="url(#fo-glow)" />
      {[[10, 0.55], [60, 0.7], [200, 0.7], [250, 0.55]].map(([x, o]) => (
        <path key={x} d={`M${x} 340 L${x + 25} 150 L${x + 50} 340 Z`} fill="#174ea6" opacity={o} />
      ))}
      {[[-10, 0.9], [230, 0.9]].map(([x, o]) => (
        <path key={x} d={`M${x} 400 L${x + 40} 120 L${x + 80} 400 Z`} fill="#0f2f6b" opacity={o} />
      ))}
      <path d="M120 400 Q150 300 150 230 Q150 300 180 400 Z" fill="#ffffff" opacity="0.7" />
      <g transform="translate(142 250)">
        <circle cx="8" cy="0" r="6" fill="#0f2f6b" />
        <path d="M2 8 L14 8 L18 34 L-2 34 Z" fill="#0f2f6b" />
      </g>
      {[[90, 180], [210, 160], [170, 120], [120, 260], [190, 280]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#38bdf8" />
      ))}
    </svg>
  );
}

export function ClockmakerArt() {
  const teeth = (cx, cy, r, n) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return (
        <rect
          key={i}
          x={cx - 3}
          y={cy - r - 7}
          width="6"
          height="10"
          rx="1"
          transform={`rotate(${(a * 180) / Math.PI} ${cx} ${cy})`}
        />
      );
    });

  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" fill="none">
      <defs>
        <linearGradient id="cl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfe5ff" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#cl-bg)" />
      <g fill="#174ea6" opacity="0.55">
        <circle cx="110" cy="150" r="52" />
        {teeth(110, 150, 52, 14)}
      </g>
      <circle cx="110" cy="150" r="20" fill="#cfe5ff" />
      <g fill="#ffffff" opacity="0.75">
        <circle cx="200" cy="230" r="36" />
        {teeth(200, 230, 36, 10)}
      </g>
      <circle cx="200" cy="230" r="12" fill="#3b82f6" />
      <circle cx="150" cy="310" r="50" stroke="#ffffff" strokeWidth="2" />
      <path d="M150 310 L150 278 M150 310 L172 322" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="150" cy="310" r="3" fill="#ffffff" />
    </svg>
  );
}
