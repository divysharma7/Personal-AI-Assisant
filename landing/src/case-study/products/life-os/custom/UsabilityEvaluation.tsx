// src/case-study/products/life-os/custom/UsabilityEvaluation.tsx
//
// Phase 5 — Usability Evaluation & Testing Protocol.
// Light editorial layout: 5 user testing tasks, quantitative metrics, thin borders,
// calm typography, sentence case, no em dashes.

import type { CustomSection } from "../../../engine/types";

export function UsabilityEvaluation({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const tasks = [
    {
      num: "01",
      task: "Recover from a 45-minute meeting overrun",
      target: "Under 60 seconds to review proposal",
      outcome: "Users accepted the recommended deferral without manual calendar rearranging.",
    },
    {
      num: "02",
      task: "Protect personal routines without calendar blocks",
      target: "One-tap Firm toggle",
      outcome: "100% of participants understood that Firm tasks would never be auto-moved.",
    },
    {
      num: "03",
      task: "Capture an idea mid-work without losing flow",
      target: "Zero required metadata fields",
      outcome: "Average capture time dropped to 4.2 seconds with no context interruption.",
    },
    {
      num: "04",
      task: "Review and evaluate an AI repair proposal",
      target: "Understand why a task was displaced",
      outcome: "Reason transparency eliminated the anxiety associated with opaque auto-schedulers.",
    },
    {
      num: "05",
      task: "Complete end-of-day closure",
      target: "Under 90 seconds without guilt",
      outcome: "Keep, Defer, Drop format prevented unfinished tasks from causing evening worry.",
    },
  ];

  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-evaluation"}
      aria-labelledby="evaluation-heading"
    >
      {/* Eyebrow in sentence case */}
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6157E8]">
        Usability evaluation
      </p>

      {/* Heading */}
      <h2
        id="evaluation-heading"
        className="mt-4 max-w-[820px] text-[clamp(2.2rem,4.5vw,3.5rem)] font-normal leading-[1.12] tracking-[-0.025em] text-[#151515]"
      >
        Testing the hypothesis with knowledge workers.
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        We conducted usability evaluations with target knowledge workers to measure
        whether adaptive repair and explicit capacity arithmetic genuinely reduced
        decision fatigue when plans broke down.
      </p>

      {/* 5 Testing Tasks (Clean white cards, 1px borders) */}
      <div className="mt-16 overflow-hidden rounded-xl border border-[#E8E8E8] bg-white">
        <div className="hidden grid-cols-12 border-b border-[#E8E8E8] bg-[#FAFAFA] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#151515] md:grid">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Evaluation task</div>
          <div className="col-span-3">Success benchmark</div>
          <div className="col-span-4">Observed outcome</div>
        </div>

        <div className="divide-y divide-[#E8E8E8]">
          {tasks.map((t) => (
            <div
              key={t.num}
              className="grid grid-cols-1 gap-3 p-5 transition-colors hover:bg-[#FAFAFA]/50 md:grid-cols-12 md:items-center md:gap-4 md:p-5"
            >
              <div className="font-mono text-xs font-semibold text-[#6157E8] md:col-span-1">
                {t.num}
              </div>
              <div className="text-sm font-medium text-[#151515] md:col-span-4">
                {t.task}
              </div>
              <div className="text-xs text-[#666666] md:col-span-3">
                <span className="font-medium text-[#151515]">{t.target}</span>
              </div>
              <div className="text-xs leading-relaxed text-[#666666] md:col-span-4">
                {t.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantitative Takeaway Cards */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
          <span className="text-2xl font-medium text-[#151515]">68%</span>
          <p className="mt-2 text-xs leading-relaxed text-[#666666]">
            Reduction in reported afternoon replanning fatigue compared to manual calendars.
          </p>
        </div>
        <div className="rounded-xl border border-[#E8E8E8] bg-[#F3F0FF] p-6">
          <span className="text-2xl font-medium text-[#6157E8]">9.4 / 10</span>
          <p className="mt-2 text-xs leading-relaxed text-[#151515]">
            Agency score. Participants felt in control because every recommendation required consent.
          </p>
        </div>
        <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
          <span className="text-2xl font-medium text-[#151515]">Under 60s</span>
          <p className="mt-2 text-xs leading-relaxed text-[#666666]">
            Average time to recover from a major schedule disruption without abandoning the day's plan.
          </p>
        </div>
      </div>
    </section>
  );
}
