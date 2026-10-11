// src/case-study/products/life-os/custom/CandidatesCriteria.tsx
//
// 03-problem-convergence.md — "1.1 Candidates and criteria".
// Eight candidates traced to Phase 1 or 2, and a six-criterion rubric (1–5, 30 max).

import type { CustomSection } from "../../../engine/types";

export interface CandidateItem {
  name: string;
  traces: string;
}

export interface CriterionItem {
  name: string;
  five: string;
  one: string;
}

export interface CandidatesCriteriaData {
  intro: string;
  candidates: CandidateItem[];
  criteria: CriterionItem[];
}

export function CandidatesCriteria({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, candidates, criteria } = data as CandidatesCriteriaData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {candidates.map((c, i) => (
          <article key={c.name} className="rounded-xl border border-border bg-bg-secondary p-5">
            <span className="text-xs font-semibold text-text-muted">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-1 text-sm font-medium text-text-primary">{c.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">{c.traces}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">Criterion (1–5 each, 30 max)</th>
              <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-accent-light">5 means</th>
              <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">1 means</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.name}>
                <th scope="row" className="border-b border-border px-4 py-3 text-left font-semibold text-text-primary">{c.name}</th>
                <td className="border-b border-border px-4 py-3 text-text-secondary">{c.five}</td>
                <td className="border-b border-border px-4 py-3 text-text-muted">{c.one}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
