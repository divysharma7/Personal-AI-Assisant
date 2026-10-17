import type { HeroPhase } from "./useHeroSequence";

interface HeroScrollIndicatorProps {
  phase: HeroPhase;
  onSelectPhase?: (phase: HeroPhase) => void;
}

const phases: { id: HeroPhase; label: string }[] = [
  { id: "full", label: "Overview" },
  { id: "statement", label: "Statement" },
  { id: "strip", label: "Mission" },
  { id: "return", label: "System" },
];

export function HeroScrollIndicator({
  phase,
  onSelectPhase,
}: HeroScrollIndicatorProps) {
  return (
    <nav
      className="heroScrollIndicator"
      aria-label="Hero visual sequence milestones"
    >
      <div className="heroScrollIndicator__track">
        {phases.map((p) => {
          const isActive = phase === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-current={isActive ? "step" : undefined}
              className={`heroScrollIndicator__item ${
                isActive ? "heroScrollIndicator__item--active" : ""
              }`}
              onClick={() => onSelectPhase?.(p.id)}
            >
              <span className="heroScrollIndicator__dot" aria-hidden="true" />
              <span className="heroScrollIndicator__label">{p.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
