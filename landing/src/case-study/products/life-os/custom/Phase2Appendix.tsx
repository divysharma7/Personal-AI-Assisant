// src/case-study/products/life-os/custom/Phase2Appendix.tsx
//
// 02-empathy-deepening.md — Phase 2 appendix: self-audit, SUCCESs, project
// state, and the primary-research handoff. Collapsible so it never interrupts
// the narrative.

import type { CustomSection } from "../../../engine/types";

export interface Phase2AppendixData {
  summaryLabel: string;
  primaryResearch: { title: string; who: string; how: string; measure: string };
  selfAudit: { title: string; weakest: string; rows: { dimension: string; score: string; justification: string }[] };
  success: { title: string; rows: { principle: string; where: string }[] };
  projectState: { title: string; items: string[] };
}

function TableWrap({ headers, children }: { headers: string[]; children: React.ReactNode[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-[560px] w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="border-b border-border bg-bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Phase2Appendix({ data, section }: { data: unknown; section: CustomSection }) {
  const { summaryLabel, primaryResearch, selfAudit, success, projectState } =
    data as Phase2AppendixData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      <details className="group rounded-2xl border border-border bg-bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium text-text-primary md:px-8">
          <span>{summaryLabel}</span>
          <span className="text-text-muted transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
        </summary>
        <div className="space-y-12 px-6 pb-10 md:px-8">
          {/* Primary research plan */}
          <div>
            <h3 className="text-lg font-medium text-text-primary">{primaryResearch.title}</h3>
            <ul className="mt-4 max-w-text space-y-2 text-sm leading-relaxed text-text-secondary">
              <li className="border-l-2 border-border pl-4"><span className="font-medium text-text-primary">Who:</span> {primaryResearch.who}</li>
              <li className="border-l-2 border-border pl-4"><span className="font-medium text-text-primary">How:</span> {primaryResearch.how}</li>
              <li className="border-l-2 border-border pl-4"><span className="font-medium text-text-primary">Measure:</span> {primaryResearch.measure}</li>
            </ul>
          </div>

          {/* Self-audit */}
          <div>
            <h3 className="text-lg font-medium text-text-primary">{selfAudit.title}</h3>
            <TableWrap headers={["Dimension", "Score", "Justification"]}>
              {selfAudit.rows.map((r) => (
                <tr key={r.dimension}>
                  <th scope="row" className="border-b border-border px-4 py-3 text-left font-semibold text-text-primary">{r.dimension}</th>
                  <td className="border-b border-border px-4 py-3 text-accent-light">{r.score}</td>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">{r.justification}</td>
                </tr>
              ))}
            </TableWrap>
            <p className="mt-3 text-sm font-medium text-gold">{selfAudit.weakest}</p>
          </div>

          {/* SUCCESs */}
          <div>
            <h3 className="text-lg font-medium text-text-primary">{success.title}</h3>
            <TableWrap headers={["Principle", "Where it shows"]}>
              {success.rows.map((r) => (
                <tr key={r.principle}>
                  <th scope="row" className="border-b border-border px-4 py-3 text-left font-semibold text-text-primary">{r.principle}</th>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">{r.where}</td>
                </tr>
              ))}
            </TableWrap>
          </div>

          {/* Project state */}
          <div>
            <h3 className="text-lg font-medium text-text-primary">{projectState.title}</h3>
            <ul className="mt-4 max-w-text space-y-2 text-sm leading-relaxed text-text-secondary">
              {projectState.items.map((item) => (
                <li key={item} className="border-l-2 border-border pl-4">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </section>
  );
}
