// src/case-study/products/life-os/custom/PublicVoices.tsx
//
// 02-empathy-deepening.md — "What our stakeholders said".
// Four real HN public voices [P] + two dashed "to collect" interview slots.
// Triangulation failure is honest: HN skews technical, no India, two empty roles.

import type { CustomSection } from "../../../engine/types";

export interface VoiceQuote {
  role: string;
  verbatim: string;
  date: string;
  href: string;
  caveat?: string;
  highlight?: boolean;
}

export interface VoiceSlot {
  role: string;
  question: string;
}

export interface PublicVoicesData {
  intro: string;
  quotes: VoiceQuote[];
  slots: VoiceSlot[];
  triangulation: string;
  teamLeadNote: string;
}

export function PublicVoices({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, quotes, slots, triangulation, teamLeadNote } = data as PublicVoicesData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {quotes.map((quote) => (
          <article
            key={quote.role + quote.date}
            className={`rounded-2xl border p-6 ${
              quote.highlight ? "border-accent bg-accent-soft" : "border-border bg-bg-secondary"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-accent-light">
              {quote.role}
              {quote.highlight && <span className="ml-2 text-gold">most relevant</span>}
            </p>
            <blockquote className="mt-3 text-sm leading-relaxed text-text-primary">
              {quote.verbatim}
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={quote.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent-light underline-offset-2 hover:underline"
              >
                {quote.date}
              </a>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium tracking-wide text-text-secondary">
                [P]
              </span>
            </div>
            {quote.caveat && (
              <p className="mt-3 text-xs italic text-text-muted">{quote.caveat}</p>
            )}
          </article>
        ))}

        {slots.map((slot) => (
          <article
            key={slot.role}
            className="rounded-2xl border border-dashed border-border p-6"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
              {slot.role}
            </p>
            <p className="mt-3 text-sm italic leading-relaxed text-text-muted">{slot.question}</p>
            <span className="mt-3 inline-block rounded-full border border-dashed border-border px-2.5 py-0.5 text-[11px] tracking-wide text-text-muted">
              Interview slot
            </span>
          </article>
        ))}
      </div>

      <div className="mt-8 max-w-text space-y-3">
        <p className="text-sm font-medium text-text-secondary">{triangulation}</p>
        <p className="text-sm leading-relaxed text-text-secondary">{teamLeadNote}</p>
      </div>
    </section>
  );
}
