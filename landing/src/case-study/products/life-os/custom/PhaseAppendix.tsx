// src/case-study/products/life-os/custom/PhaseAppendix.tsx
//
// 01-discovery-brief.md Ã¢â‚¬â€ the appendix-tier blocks (interview guide, evidence
// register E1Ã¢â‚¬â€œE8, decision log, self-audit, SUCCESs, project state). Rendered as
// a collapsible source/method layer so it never interrupts the main narrative.

import type { CustomSection } from "../../../engine/types";

export interface EvidenceRow {
  id: string;
  sourceText: string;
  href?: string;
  verified: string;
  doesntEstablish: string;
}

export interface PhaseAppendixData {
  summaryLabel: string;
  interview: {
    title: string;
    questions: string[];
    recruit: string;
    note: string;
  };
  evidence: { title: string; note: string; rows: EvidenceRow[] };
  decisions: { title: string; rows: { n: string; question: string; decision: string; by: string }[] };
  selfAudit: { title: string; weakest: string; rows: { dimension: string; score: string; justification: string }[] };
  success: { title: string; rows: { principle: string; where: string }[] };
  projectState: { title: string; items: string[] };
}

function TableWrap({ headers, children }: { headers: string[]; children: React.ReactNode[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-[640px] w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" className="border-b border-border bg-bg-surface px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function PhaseAppendix({ data, section }: { data: unknown; section: CustomSection }) {
  const { summaryLabel, interview, evidence, decisions, selfAudit, success, projectState } =
    data as PhaseAppendixData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10 " id={section.id}>
      <details className="group rounded-2xl border border-border bg-bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium text-text-primary md:px-8">
          <span>{summaryLabel}</span>
          <span className="text-text-muted transition-transform group-open:rotate-180" aria-hidden="true">Ã¢Å’â€ž</span>
        </summary>
        <div className="space-y-12 px-6 pb-10 md:px-8">
          {/* Interview guide */}
          <div>
            <h3 className="text-lg font-medium text-text-primary">{interview.title}</h3>
            <ol className="mt-4 max-w-text list-decimal space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
              {interview.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
            <p className="mt-4 max-w-text text-sm leading-relaxed text-text-secondary">{interview.recruit}</p>
            <p className="mt-3 text-xs italic text-text-muted">{interview.note}</p>
          </div>

          {/* Evidence register */}
          <div>
            <h3 className="text-lg font-medium text-text-primary">{evidence.title}</h3>
            <TableWrap headers={["ID", "Source and date", "Verified", "Doesn't establish"]}>
              {evidence.rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="border-b border-border px-4 py-3 text-left font-semibold text-text-primary">{r.id}</th>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noreferrer" className="text-accent-light underline-offset-2 hover:underline">{r.sourceText}</a>
                    ) : (
                      r.sourceText
                    )}
                  </td>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">{r.verified}</td>
                  <td className="border-b border-border px-4 py-3 text-text-muted">{r.doesntEstablish}</td>
                </tr>
              ))}
            </TableWrap>
            <p className="mt-3 text-xs italic text-text-muted">{evidence.note}</p>
          </div>

          {/* Decision log */}
          <div>
            <h3 className="text-lg font-medium text-text-primary">{decisions.title}</h3>
            <TableWrap headers={["#", "Question", "Decision", "Made by"]}>
              {decisions.rows.map((r) => (
                <tr key={r.n}>
                  <th scope="row" className="border-b border-border px-4 py-3 text-left font-semibold text-text-primary">{r.n}</th>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">{r.question}</td>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">{r.decision}</td>
                  <td className="border-b border-border px-4 py-3 text-text-muted">{r.by}</td>
                </tr>
              ))}
            </TableWrap>
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
