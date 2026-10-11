// src/case-study/products/life-os/custom/CulturalScripts.tsx
//
// 02-empathy-deepening.md Ã¢â‚¬â€ "Three cultural scripts".
// Script 2 embeds a Hacker News pull quote [P]. Use and delegation are stated
// attitudes, never shown as calendar-delegation consent.

import type { CustomSection } from "../../../engine/types";

export interface ScriptQuote {
  text: string;
  attribution: string;
  date: string;
  href: string;
}

export interface CulturalScript {
  n: string;
  title: string;
  body?: string;
  quote?: ScriptQuote;
  tag?: string;
}

export interface CulturalScriptsData {
  scripts: CulturalScript[];
}

export function CulturalScripts({ data, section }: { data: unknown; section: CustomSection }) {
  const { scripts } = data as CulturalScriptsData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10 " id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}

      <div className="mt-8 space-y-6">
        {scripts.map((script) => (
          <article key={script.n} className="rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
            <h3 className="text-lg font-semibold italic text-text-primary">
              <span className="text-accent-light">{script.n}.</span> {script.title}
            </h3>
            {script.body && (
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-text-secondary">{script.body}</p>
            )}
            {script.tag && (
              <span className="mt-3 inline-block rounded-full border border-border px-2 py-0.5 text-[11px] font-medium tracking-wide text-text-secondary">
                {script.tag}
              </span>
            )}
            {script.quote && (
              <figure className="mt-5 rounded-xl border border-border bg-bg-surface p-6">
                <span aria-hidden="true" className="block text-4xl leading-none text-accent">&ldquo;</span>
                <blockquote className="mt-1 max-w-2xl text-base leading-relaxed text-text-primary">
                  {script.quote.text}
                </blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm italic text-text-secondary">
                  <span>{script.quote.attribution}</span>
                  <a href={script.quote.href} target="_blank" rel="noreferrer" className="not-italic text-accent-light underline-offset-2 hover:underline">
                    {script.quote.date}
                  </a>
                  <span className="not-italic rounded-full border border-border px-2 py-0.5 text-[11px] font-medium tracking-wide text-text-secondary">[P]</span>
                </figcaption>
              </figure>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
