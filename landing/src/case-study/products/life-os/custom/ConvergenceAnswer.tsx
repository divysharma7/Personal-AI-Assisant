// src/case-study/products/life-os/custom/ConvergenceAnswer.tsx
//
// 03-problem-convergence.md — "The answer first".
// Chosen problem: capacity-aware re-planning after disruption (22/30, third).
// The weakness is visible at a glance — not hidden.

import { Check, AlertTriangle } from "lucide-react";
import type { CustomSection } from "../../../engine/types";

export interface ConvergenceAnswerData {
  hmw: string;
  chosenProblem: string;
  scene: { label: string; text: string };
  whyLeads: string[];
  whereWeak: string[];
}

export function ConvergenceAnswer({ data, section }: { data: unknown; section: CustomSection }) {
  const { hmw, chosenProblem, scene, whyLeads, whereWeak } = data as ConvergenceAnswerData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}

      <blockquote className="mt-8 rounded-2xl border-l-2 border-[#e08a7b] bg-[rgba(224,138,123,0.08)] px-6 py-5 md:px-8 md:py-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#e08a7b]">How might we</p>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-text-primary md:text-lg">{hmw}</p>
      </blockquote>

      <blockquote className="mt-4 rounded-2xl border-l-2 border-accent bg-accent-soft px-6 py-5 md:px-8 md:py-6">
        <p className="text-xs font-medium uppercase tracking-widest text-accent-light">Chosen problem</p>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-text-primary md:text-lg">{chosenProblem}</p>
      </blockquote>

      <div className="mt-6 rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">{scene.label}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{scene.text}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-light">
            <Check size={16} /> Why it leads
          </h3>
          <ul className="mt-4 space-y-3">
            {whyLeads.map((item, i) => (
              <li key={i} className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-[rgba(90,100,120,0.08)] p-6 md:p-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-muted">
            <AlertTriangle size={16} /> Where it's weak
          </h3>
          <ul className="mt-4 space-y-3">
            {whereWeak.map((item, i) => (
              <li key={i} className="border-l-2 border-text-muted pl-4 text-sm leading-relaxed text-text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
