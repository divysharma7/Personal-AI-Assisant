// src/case-study/products/life-os/custom/FinalSolutionScreens.tsx
//
// Phase 4 — Final Solution Design & Core Product Flows.
// Light editorial layout: 4 core interactions, clear rationale, thin borders,
// generous whitespace, sentence case, no em dashes.

import type { CustomSection } from "../../../engine/types";

export function FinalSolutionScreens({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const features = [
    {
      number: "01",
      title: "Real focus capacity arithmetic",
      tagline: "Calendar events become true executable time.",
      description:
        "Standard calendars show empty gaps that give an illusion of infinite time. Life OS calculates actual focus capacity by subtracting meetings, protected routines, and transition allowances. This shows the user exactly what can realistically fit today.",
      mockDetails: {
        badge: "Capacity engine",
        stat1: "540 min planning window",
        stat2: "minus 190 min fixed meetings",
        stat3: "minus 45 min protected routines",
        result: "Equals 185 usable focus minutes",
      },
    },
    {
      number: "02",
      title: "The 4-part repair proposal",
      tagline: "When the day breaks, repair it without starting from scratch.",
      description:
        "When a meeting overruns, Life OS does not force you to rebuild your afternoon. It displays a four-line card: Trigger, Proposed Move, Protected Commitments, and Control. The system explains every change and leaves the final choice with the user.",
      mockDetails: {
        badge: "Adaptive repair",
        stat1: "Trigger: Meeting ran 45m over",
        stat2: "Proposed: Defer client notes to tomorrow",
        stat3: "Protected: Deep work and gym preserved",
        result: "Control: One-tap accept with complete undo",
      },
    },
    {
      number: "03",
      title: "Mark what is firm",
      tagline: "Protect commitments that live only in your head.",
      description:
        "Most auto-schedulers move personal routines or focus blocks because they do not see them as hard appointments. With one tap, users can mark any task Firm. The repair engine routes all disruptions around it, preserving personal boundaries.",
      mockDetails: {
        badge: "Agency and boundaries",
        stat1: "Firm: Cannot be moved by repair",
        stat2: "Flexible: Can shift within time window",
        stat3: "Unscheduled: Important, holds no time yet",
        result: "Zero surprise calendar overwrites",
      },
    },
    {
      number: "04",
      title: "One-tap start and zero-guilt shutdown",
      tagline: "Lower startup friction and close the day calmly.",
      description:
        "Starting a task takes one click into a focused session with no setup ritual. At the end of the day, an optional 60-second review lets you Keep, Defer, or Drop unfinished tasks without guilt scores or moralizing streaks.",
      mockDetails: {
        badge: "Execution and closure",
        stat1: "One-click focus initiation",
        stat2: "No required morning or evening rituals",
        stat3: "Keep, Defer, or Drop closure",
        result: "End the day with zero open mental loops",
      },
    },
  ];

  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-final-design"}
      aria-labelledby="final-design-heading"
    >
      {/* Eyebrow in sentence case */}
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6157E8]">
        Final solution design
      </p>

      {/* Heading */}
      <h2
        id="final-design-heading"
        className="mt-4 max-w-[820px] text-[clamp(2.2rem,4.5vw,3.5rem)] font-normal leading-[1.12] tracking-[-0.025em] text-[#151515]"
      >
        A system designed for when reality breaks the plan.
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        Life OS moves the needle from passive task storage to active friction reduction.
        Instead of asking you to be more disciplined, it protects your attention when the
        day inevitably gets messy.
      </p>

      {/* 4 Feature Walkthroughs */}
      <div className="mt-16 space-y-12">
        {features.map((feat) => (
          <div
            key={feat.number}
            className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[#E8E8E8] bg-white p-8 md:p-10 lg:grid-cols-12 lg:gap-12"
          >
            {/* Left Column: Narrative (7 cols) */}
            <div className="lg:col-span-7">
              <span className="font-mono text-xs font-semibold text-[#6157E8]">
                {feat.number} · {feat.mockDetails.badge}
              </span>
              <h3 className="mt-2 text-2xl font-medium text-[#151515]">
                {feat.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#151515]/80">
                {feat.tagline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#666666]">
                {feat.description}
              </p>
            </div>

            {/* Right Column: Interaction Blueprint Card (5 cols) */}
            <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-5 lg:col-span-5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E8A]">
                Interaction mechanism
              </span>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-[#E8E8E8]/70 pb-2 text-[#666666]">
                  <span>{feat.mockDetails.stat1}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E8E8E8]/70 pb-2 text-[#666666]">
                  <span>{feat.mockDetails.stat2}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E8E8E8]/70 pb-2 text-[#666666]">
                  <span>{feat.mockDetails.stat3}</span>
                </div>
                <div className="pt-1 font-medium text-[#6157E8]">
                  <span>{feat.mockDetails.result}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
