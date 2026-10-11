// src/case-study/products/life-os/custom/FiltrationFunnel.tsx
//
// 02-empathy-deepening.md Ã¢â‚¬â€ "Filtration funnel: where an intention gets lost".
// Eight hand-offs narrowing left to right, with a colored notch for each leak:
// accent/gold where a verified source supports it, grey dashed where it is a
// hypothesis. A behavioral model, not a measured conversion funnel.

import type { CustomSection } from "../../../engine/types";

export interface FunnelStep {
  n: string;
  handoff: string;
  leak: string;
  evidence: "H" | "E" | "P";
  evidenceDetail?: string;
}

export interface FiltrationFunnelData {
  intro: string;
  steps: FunnelStep[];
  widening: string;
}

const EVIDENCE_BORDER: Record<FunnelStep["evidence"], string> = {
  H: "border-l-2 border-dashed border-border",
  E: "border-l-2 border-accent",
  P: "border-l-2 border-gold",
};

const EVIDENCE_TAG: Record<FunnelStep["evidence"], string> = {
  H: "border-border text-text-muted",
  E: "border-accent text-accent-light",
  P: "border-[rgba(232,184,79,0.5)] text-gold",
};

export function FiltrationFunnel({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, steps, widening } = data as FiltrationFunnelData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10 " id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-6 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <ol className="mt-8 space-y-2">
        {steps.map((step, i) => {
          const widthPercent = 100 - i * 7;
          return (
            <li
              key={step.n}
              className={`mx-auto flex items-center gap-4 rounded-xl bg-bg-secondary p-4 md:p-5 ${EVIDENCE_BORDER[step.evidence]}`}
              style={{ maxWidth: `${widthPercent}%` }}
            >
              <span className="text-sm font-semibold text-text-muted">{step.n}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{step.handoff}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">{step.leak}</p>
              </div>
              <span className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${EVIDENCE_TAG[step.evidence]}`}>
                [{step.evidence}]
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex items-start gap-3 max-w-text">
        <span className="mt-0.5 flex-shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-muted">[H]</span>
        <p className="text-sm leading-relaxed text-text-secondary">{widening}</p>
      </div>
    </section>
  );
}
