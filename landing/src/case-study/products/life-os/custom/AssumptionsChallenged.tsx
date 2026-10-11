// src/case-study/products/life-os/custom/AssumptionsChallenged.tsx
//
// 02-empathy-deepening.md — "Assumptions challenged".
// "Challenged," not "invalidated," because we hold no primary data.

import type { CustomSection } from "../../../engine/types";

export interface AssumptionRow {
  assumed: string;
  found: string;
  status: "Challenged" | "Revised";
}

export interface AssumptionsChallengedData {
  intro: string;
  rows: AssumptionRow[];
}

const STATUS_TONE: Record<AssumptionRow["status"], string> = {
  Challenged: "border-[rgba(224,138,123,0.4)] text-[#e08a7b] bg-[rgba(224,138,123,0.08)]",
  Revised: "border-[rgba(232,184,79,0.4)] text-gold bg-[rgba(232,184,79,0.08)]",
};

export function AssumptionsChallenged({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, rows } = data as AssumptionsChallengedData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-sm italic leading-relaxed text-text-muted">{intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.assumed} className="rounded-2xl border border-border bg-bg-secondary p-6">
            <p className="text-sm font-medium text-text-muted line-through">{row.assumed}</p>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{row.found}</p>
            <span className={`mt-4 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${STATUS_TONE[row.status]}`}>
              {row.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
