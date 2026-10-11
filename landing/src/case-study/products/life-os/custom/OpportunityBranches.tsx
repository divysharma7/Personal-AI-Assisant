// src/case-study/products/life-os/custom/OpportunityBranches.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "Opportunities identified: directions, not solutions".
// Branching diagram from the HMW to three arrows, each tagged with its layer
// (Infrastructure / Practice / Norms).

import type { CustomSection } from "../../../engine/types";

export interface OpportunityDirection {
  n: string;
  direction: string;
  layer: string;
}

export interface OpportunityBranchesData {
  hmw: string;
  directions: OpportunityDirection[];
  caption: string;
}

const LAYER_TONE: Record<string, string> = {
  Infrastructure: "border-accent text-accent-light",
  Practice: "border-[rgba(232,184,79,0.5)] text-gold",
  Norms: "border-[rgba(224,138,123,0.5)] text-[#e08a7b]",
};

export function OpportunityBranches({ data, section }: { data: unknown; section: CustomSection }) {
  const { hmw, directions, caption } = data as OpportunityBranchesData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10 " id={section.id}>
      {section.eyebrow && (
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-accent">
          {section.eyebrow}
        </p>
      )}
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}

      <div className="mt-8 flex flex-col items-center">
        <div className="max-w-2xl rounded-2xl border border-accent bg-accent-soft px-6 py-5 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">How might we</p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">{hmw}</p>
        </div>

        <svg viewBox="0 0 1000 90" className="mt-1 hidden w-full max-w-3xl md:block" aria-hidden="true">
            <path d="M500 0 C 500 45, 170 45, 170 90" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <path d="M500 0 L 500 90" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <path d="M500 0 C 500 45, 830 45, 830 90" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        </svg>

        <ol className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {directions.map((d) => (
            <li key={d.n} className="rounded-2xl border border-border bg-bg-secondary p-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-muted">{d.n}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${LAYER_TONE[d.layer.split(" ")[0]] ?? "border-border text-text-secondary"}`}>
                  {d.layer}
                </span>
              </div>
              <p className="mt-3 text-base font-medium text-text-primary">{d.direction}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-8 max-w-text text-sm italic leading-relaxed text-text-muted">{caption}</p>
    </section>
  );
}
