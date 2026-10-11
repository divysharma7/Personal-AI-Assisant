// src/case-study/products/life-os/custom/ProblemMap.tsx
//
// 02-empathy-deepening.md — "Problem mapping".
// Six branches (A–F) radiating from one question, with evidence dots showing
// which branches rest on a source and which are reasoning.

import type { CustomSection } from "../../../engine/types";

export interface ProblemBranch {
  letter: string;
  title: string;
  subIssues: string;
  evidence: "H" | "E" | "P";
  evidenceDetail?: string;
}

export interface ProblemMapData {
  intro: string;
  centralQuestion: string;
  branches: ProblemBranch[];
  newInsight: string;
}

const EVIDENCE_DOT: Record<ProblemBranch["evidence"], string> = {
  H: "border border-dashed border-text-muted",
  E: "bg-accent",
  P: "bg-gold",
};

const EVIDENCE_TAG: Record<ProblemBranch["evidence"], string> = {
  H: "border-border text-text-muted",
  E: "border-accent text-accent-light",
  P: "border-[rgba(232,184,79,0.5)] text-gold",
};

export function ProblemMap({ data, section }: { data: unknown; section: CustomSection }) {
  const { intro, centralQuestion, branches, newInsight } = data as ProblemMapData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">{intro}</p>

      <div className="mt-8 flex items-center justify-center">
        <span className="rounded-2xl border border-accent bg-accent-soft px-6 py-4 text-center text-base italic text-text-primary md:text-lg">
          {centralQuestion}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <article key={branch.letter} className="rounded-2xl border border-border bg-bg-secondary p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-text-muted">{branch.letter}</span>
                <h3 className="text-sm font-semibold text-text-primary">{branch.title}</h3>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${EVIDENCE_DOT[branch.evidence]}`} aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{branch.subIssues}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${EVIDENCE_TAG[branch.evidence]}`}>
                [{branch.evidence}]
              </span>
              {branch.evidenceDetail && (
                <span className="text-xs text-text-muted">{branch.evidenceDetail}</span>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-bg-surface p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">New insight</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{newInsight}</p>
      </div>
    </section>
  );
}
