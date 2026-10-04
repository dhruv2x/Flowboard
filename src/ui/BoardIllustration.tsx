/** Decorative mini kanban board with one card floating between columns. Static when reduced motion is on. */
export function BoardIllustration() {
  return (
    <svg viewBox="0 0 168 112" aria-hidden className="h-36 w-auto sm:h-44">
      {[8, 62, 116].map((x, i) => (
        <g key={x}>
          <rect x={x} y="8" width="44" height="96" rx="6" className="fill-surface-muted" />
          <rect x={x + 6} y="14" width={16 + i * 4} height="4" rx="2" className="fill-line-strong" />
          {Array.from({ length: 3 - i }, (_, card) => (
            <g key={card}>
              <rect x={x + 4} y={24 + card * 22} width="36" height="18" rx="3" className="fill-surface stroke-line" />
              <rect x={x + 9} y={30 + card * 22} width={18 - card * 3} height="3" rx="1.5" className="fill-line-strong" />
            </g>
          ))}
        </g>
      ))}
      <g className="origin-center [transform-box:fill-box] motion-safe:animate-float">
        <rect x="70" y="50" width="38" height="20" rx="3" className="fill-surface stroke-accent" strokeWidth="1.5" />
        <rect x="76" y="56" width="20" height="3" rx="1.5" className="fill-accent/60" />
        <rect x="76" y="62" width="12" height="3" rx="1.5" className="fill-line-strong" />
      </g>
    </svg>
  );
}
