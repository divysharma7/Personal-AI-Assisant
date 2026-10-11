// src/case-study/products/life-os/custom/SignalsWall.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ "Signals, not interviews". Three icon-led signal
// blocks, a pull-quote card for the public [P] voice, the counterexample quote,
// and the synthetic [S] dry-run table. Public signals and synthetic material are
// explicitly distinguished Ã¢â‚¬â€ never presented as interviews.

import { ArrowLeftRight, Globe, MessageSquare } from "lucide-react";
import type { CustomSection } from "../../../engine/types";

export interface SignalDatum {
  title: string;
  body: string;
  icon: "switch" | "clock" | "chat";
}

export interface QuoteDatum {
  text: string;
  attribution: string;
  date: string;
  href: string;
  caption?: string;
}

export interface SignalsWallData {
  intro: string;
  legend: { kind: string; text: string }[];
  signals: SignalDatum[];
  quote: QuoteDatum;
  meetingNote: string;
  secondQuote: QuoteDatum;
  syntheticLabel: string;
  dryRun: { question: string; pattern: string; hypothesis: string }[];
}

const icons = {
  switch: ArrowLeftRight,
  clock: Globe,
  chat: MessageSquare,
};

function QuoteCard({ quote }: { quote: QuoteDatum }) {
  return (
    <figure className="mt-8 rounded-2xl border border-border bg-bg-secondary p-6 md:p-10">
      <span aria-hidden="true" className="block text-5xl leading-none text-accent">
        &ldquo;
      </span>
      <blockquote className="mt-2 max-w-3xl text-lg leading-relaxed text-text-primary">
        {quote.text}
      </blockquote>
      <figcaption className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm italic text-text-secondary">
        <span>{quote.attribution}</span>
        <a
          href={quote.href}
          target="_blank"
          rel="noreferrer"
          className="not-italic text-accent-light underline-offset-2 hover:underline"
        >
          {quote.date}
        </a>
        <span className="not-italic">
          <span title="public signal" className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium tracking-wide text-text-secondary">
            [P] <span className="sr-only">public signal</span>
          </span>
        </span>
      </figcaption>
      {quote.caption && (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted">{quote.caption}</p>
      )}
    </figure>
  );
}

export function SignalsWall({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, legend, signals, quote, meetingNote, secondQuote, syntheticLabel, dryRun } =
    data as SignalsWallData;

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

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {legend.map((item) => (
          <li key={item.kind} className="flex items-center gap-2 text-xs text-text-muted">
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              {item.kind}
            </span>
            {item.text}
          </li>
        ))}
      </ul>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {signals.map((signal) => {
          const Icon = icons[signal.icon];
          return (
            <article key={signal.title} className="rounded-2xl border border-border bg-bg-secondary p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-surface text-accent-light">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-text-primary">{signal.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{signal.body}</p>
            </article>
          );
        })}
      </div>

      <QuoteCard quote={quote} />

      <p className="mt-8 max-w-text text-base leading-relaxed text-text-secondary">{meetingNote}</p>

      <QuoteCard quote={secondQuote} />

      <div className="mt-12">
        <h3 className="max-w-3xl text-xl font-medium text-text-primary">{syntheticLabel}</h3>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-[640px] w-full border-collapse text-sm">
            <thead>
              <tr>
                {["Question", "Pattern in the dry run", "Hypothesis to test"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="border-b border-border bg-bg-surface px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dryRun.map((row) => (
                <tr key={row.question}>
                  <th scope="row" className="border-b border-border px-5 py-4 text-left font-medium text-text-primary">
                    {row.question}
                  </th>
                  <td className="border-b border-border px-5 py-4 text-text-secondary">{row.pattern}</td>
                  <td className="border-b border-border px-5 py-4 text-text-secondary">{row.hypothesis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
