// src/case-study/products/life-os/custom/BeliefBehaviorSplit.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "The Indian perspective: high AI use, high strain".
// Visual request: a split card, belief on the left and behavior on the right,
// with a thin year label under each figure.

import type { CustomSection } from "../../../engine/types";

export interface BeliefBehaviorDatum {
  value: string;
  label: string;
  source: string;
  year: string;
}

export interface BeliefBehaviorSplitData {
  intro: string;
  belief: BeliefBehaviorDatum;
  behavior: BeliefBehaviorDatum;
  caveat: string;
}

function SplitSide({ datum }: { datum: BeliefBehaviorDatum }) {
  return (
    <div className="flex-1 p-6 md:p-8">
      <strong className="block text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-none tracking-tight text-text-primary">
        {datum.value}
      </strong>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">{datum.label}</p>
      <p className="mt-4 text-xs text-text-muted">{datum.source}</p>
      <p className="mt-1 text-xs italic text-text-muted">{datum.year}</p>
    </div>
  );
}

export function BeliefBehaviorSplit({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, belief, behavior, caveat } = data as BeliefBehaviorSplitData;
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
      <p className="mt-6 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <div className="mt-8 flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface md:flex-row">
        <SplitSide datum={belief} />
        <div className="h-px w-full bg-border md:h-auto md:w-px" aria-hidden="true" />
        <SplitSide datum={behavior} />
      </div>

      <p className="mt-8 max-w-text text-sm italic leading-relaxed text-text-muted">{caveat}</p>
    </section>
  );
}
