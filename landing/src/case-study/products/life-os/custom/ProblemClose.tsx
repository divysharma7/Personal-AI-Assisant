// src/case-study/products/life-os/custom/ProblemClose.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "Problem statement and expected impact". The HMW
// restated, the "Why now" framing, and the four-level ripple. Closes Phase 1.

import type { CustomSection } from "../../../engine/types";

export interface RippleRow {
  level: string;
  ifAnswered: string;
}

export interface ProblemCloseData {
  hmw: string;
  whyNow: string;
  ripple: RippleRow[];
  byline: string;
}

export function ProblemClose({ data, section }: { data: unknown; section: CustomSection }) {
  const { hmw, whyNow, ripple, byline } = data as ProblemCloseData;

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

      <blockquote className="hmw-callout mt-8">
        <p>{hmw}</p>
      </blockquote>

      <p className="mt-8 max-w-text text-base leading-relaxed text-text-secondary">{whyNow}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ripple.map((row) => (
          <article key={row.level} className="rounded-2xl border border-border bg-bg-secondary p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-accent">{row.level}</p>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{row.ifAnswered}</p>
          </article>
        ))}
      </div>

      <p className="mt-8 text-sm italic text-text-muted">{byline}</p>
    </section>
  );
}
