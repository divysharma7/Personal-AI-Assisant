// src/case-study/products/life-os/custom/TranslationLoop.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "Impact on the self-managing worker".
// Visual request: two bars for 78% and 68% with the gap labeled; a six-step
// horizontal funnel with the last two steps highlighted (the [H] hypothesis).

import type { CustomSection } from "../../../engine/types";

export interface TranslationLoopData {
  pair: { value: string; label: string; note: string }[];
  pairType: string;
  narrowing: string;
  framingNote: string;
  loopLabel: string;
  loopSteps: string[];
  loopNote: string;
  bars: { label: string; value: number; caption: string }[];
  gapLabel: string;
}

export function TranslationLoop({ data, section }: { data: unknown; section: CustomSection }) {
  const { pair, pairType, narrowing, framingNote, loopLabel, loopSteps, loopNote, bars, gapLabel } =
    data as TranslationLoopData;

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

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {pair.map((item) => (
          <article key={item.value} className="rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
            <strong className="block text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-none tracking-tight text-text-primary">
              {item.value}
            </strong>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">{item.label}</p>
            <p className="mt-3 text-xs text-text-muted">{item.note}</p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-sm italic text-text-muted">{pairType}</p>

      <div className="mt-8 max-w-text space-y-4 text-base leading-relaxed text-text-secondary">
        <p>{narrowing}</p>
        <p>{framingNote}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-bg-surface p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
          Where the gap shows
        </p>
        <div className="mt-6 space-y-4">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm text-text-secondary">{bar.label}</span>
                <span className="text-sm font-semibold text-text-primary">{bar.caption}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-bg-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${bar.value}%` }}
                  role="img"
                  aria-label={`${bar.label}: ${bar.caption}`}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-muted">{gapLabel}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-bg-surface p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">{loopLabel}</p>
        <ol className="mt-5 flex flex-wrap items-center gap-2">
          {loopSteps.map((step, i) => {
            const highlighted = i >= loopSteps.length - 2;
            return (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-sm ${
                    highlighted
                      ? "border-accent bg-accent-soft text-text-primary"
                      : "border-border bg-bg-secondary text-text-secondary"
                  }`}
                >
                  {step}
                </span>
                {i < loopSteps.length - 1 && (
                  <span aria-hidden="true" className="text-text-muted">
                    Ã¢â€ â€™
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-5 text-sm leading-relaxed text-text-muted">{loopNote}</p>
      </div>
    </section>
  );
}
