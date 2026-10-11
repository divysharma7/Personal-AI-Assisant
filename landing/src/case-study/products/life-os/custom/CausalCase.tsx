// src/case-study/products/life-os/custom/CausalCase.tsx
//
// 03-problem-convergence.md — "1.4 Why re-planning: the causal case".
// Hub-and-spoke: re-planning at the centre, four solid spokes and one dashed
// spoke for the lost thread. The argument is structural, not empirically tested.

import type { CustomSection } from "../../../engine/types";

export interface CausalCandidate {
  name: string;
  how: string;
  basis: string;
  dashed?: boolean;
}

export interface CausalCaseData {
  candidates: CausalCandidate[];
  note: string;
}

const BASIS_TONE: Record<string, string> = {
  Logic: "border-accent text-accent-light",
  Hypothesis: "border-border text-text-muted",
  upstream: "border-dashed border-text-muted text-text-muted",
};

export function CausalCase({ data, section }: { data: unknown; section: CustomSection }) {
  const { candidates, note } = data as CausalCaseData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}

      <div className="mt-8 flex items-center justify-center">
        <span className="rounded-2xl border border-accent bg-accent-soft px-6 py-4 text-center text-base font-semibold text-text-primary md:text-lg">
          Re-planning after disruption
        </span>
      </div>

      {/* SVG fan: 4 solid spokes + 1 dashed */}
      <svg viewBox="0 0 1000 60" className="hidden w-full md:block" aria-hidden="true">
        <line x1="500" y1="0" x2="100" y2="55" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="500" y1="0" x2="300" y2="55" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="500" y1="0" x2="700" y2="55" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="500" y1="0" x2="900" y2="55" stroke="#6366f1" strokeWidth="1.5" />
        <line x1="500" y1="0" x2="500" y2="55" stroke="#5a6478" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>

      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {candidates.map((c) => (
          <article
            key={c.name}
            className={`rounded-2xl border p-5 ${
              c.dashed ? "border-dashed border-border bg-transparent" : "border-accent bg-bg-secondary"
            }`}
          >
            <h3 className="text-sm font-semibold text-text-primary">{c.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{c.how}</p>
            <span className={`mt-3 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${c.dashed ? BASIS_TONE.upstream : c.basis === "Logic" ? BASIS_TONE.Logic : BASIS_TONE.Hypothesis}`}>
              {c.basis}
            </span>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-text text-sm leading-relaxed text-text-secondary">{note}</p>
    </section>
  );
}
