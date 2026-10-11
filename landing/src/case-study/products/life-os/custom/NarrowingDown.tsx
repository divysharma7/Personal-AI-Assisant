// src/case-study/products/life-os/custom/NarrowingDown.tsx
//
// 03-problem-convergence.md — "1.3 Narrowing down".
// Three ruled-out candidates with why-not + what-we-keep/what-would-change-mind,
// plus carried-forward constraints.

import type { CustomSection } from "../../../engine/types";

export interface RuledOutItem {
  name: string;
  label: string;
  whyNot: string;
  whatWeKeep?: string;
  whatWouldChangeMind?: string;
  whatWouldPromote?: string;
  upstream?: boolean;
}

export interface CarriedForwardItem {
  problem: string;
  becomes: string;
}

export interface NarrowingDownData {
  shortlist: string;
  ruledOut: RuledOutItem[];
  carriedForward: CarriedForwardItem[];
}

export function NarrowingDown({ data, section }: { data: unknown; section: CustomSection }) {
  const { shortlist, ruledOut, carriedForward } = data as NarrowingDownData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">{shortlist}</p>

      <div className="mt-8 space-y-4">
        {ruledOut.map((item) => (
          <article
            key={item.name}
            className={`rounded-2xl border p-6 md:p-8 ${
              item.upstream ? "border-dashed border-border bg-transparent" : "border-border bg-bg-secondary"
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-base font-semibold text-text-primary">{item.name}</h3>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${item.upstream ? "border-dashed border-text-muted text-text-muted" : "border-[rgba(224,138,123,0.4)] text-[#e08a7b]"}`}>
                {item.label}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-text-muted">Why not</p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{item.whyNot}</p>
              </div>
              {item.whatWeKeep && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-accent-light">What we keep</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{item.whatWeKeep}</p>
                </div>
              )}
              {(item.whatWouldChangeMind || item.whatWouldPromote) && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-gold">What would change our mind</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {item.whatWouldChangeMind ?? item.whatWouldPromote}
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-text-secondary">Carried forward, not led with</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-[480px] w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">Problem</th>
                <th className="border-b border-border bg-bg-surface px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-text-muted">Becomes</th>
              </tr>
            </thead>
            <tbody>
              {carriedForward.map((row) => (
                <tr key={row.problem}>
                  <th scope="row" className="border-b border-border px-4 py-3 text-left font-semibold text-text-primary">{row.problem}</th>
                  <td className="border-b border-border px-4 py-3 text-text-secondary">{row.becomes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
