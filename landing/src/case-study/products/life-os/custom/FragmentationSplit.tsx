// src/case-study/products/life-os/custom/FragmentationSplit.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "The global scenario: work is fragmented before the
// app opens". Visual request: the two-column cluster as two stacked cards, two
// stat cards side by side, and a small chain of six chips showing one task
// changing hands.

import type { CustomSection } from "../../../engine/types";

export interface FragmentationSplitData {
  intro: string[];
  external: string[];
  internal: string[];
  stats: { value: string; label: string; detail?: string; source: string }[];
  chain: string[];
  chainCaption: string;
  caveat: string;
}

export function FragmentationSplit({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, external, internal, stats, chain, chainCaption, caveat } =
    data as FragmentationSplitData;

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

      <div className="mt-6 max-w-text space-y-4 text-base leading-relaxed text-text-secondary">
        {intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
          <h3 className="text-base font-semibold text-text-primary">External fragmentation</h3>
          <ul className="mt-4 space-y-3">
            {external.map((item) => (
              <li key={item} className="border-l-2 border-border pl-4 text-sm text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
          <h3 className="text-base font-semibold text-text-primary">
            Self-management fragmentation
          </h3>
          <ul className="mt-4 space-y-3">
            {internal.map((item) => (
              <li key={item} className="border-l-2 border-border pl-4 text-sm text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-bg-surface p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
          {chainCaption}
        </p>
        <ol className="mt-4 flex flex-wrap items-center gap-2">
          {chain.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-border bg-bg-secondary px-3 py-1 text-sm text-text-primary">
                {step}
              </span>
              {i < chain.length - 1 && (
                <span aria-hidden="true" className="text-text-muted">
                  Ã¢â€ â€™
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {stats.map((stat) => (
          <article key={stat.value} className="rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
            <strong className="block text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-none tracking-tight text-text-primary">
              {stat.value}
            </strong>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">{stat.label}</p>
            {stat.detail && (
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{stat.detail}</p>
            )}
            <p className="mt-4 text-xs text-text-muted">{stat.source}</p>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-text text-sm italic leading-relaxed text-text-muted">{caveat}</p>
    </section>
  );
}
