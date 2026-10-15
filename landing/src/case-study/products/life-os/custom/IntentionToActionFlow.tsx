// src/case-study/products/life-os/custom/IntentionToActionFlow.tsx
//
// Phase 2 — Empathize: "From Intention to Action" behavioral flow.
// Simple diagram: one horizontal line (Capture → Clarify → Prioritize → Plan → Execute → Reflect)
// with clean typography underneath. No cards.

import type { CustomSection } from "../../../engine/types";

export function IntentionToActionFlow({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const steps = [
    {
      num: "01",
      name: "Capture",
      tagline: "Get it out of your head.",
      body: "Ideas and requests hit us randomly all day. Collect them quickly without interrupting what you are already doing.",
    },
    {
      num: "02",
      name: "Clarify",
      tagline: "Make the next step concrete.",
      body: "A task like 'work on portfolio' feels overwhelming. Break it down until the first click is obvious.",
    },
    {
      num: "03",
      name: "Prioritize",
      tagline: "Choose what matters now.",
      body: "Not everything deserves attention today. Identify what moves the needle instead of reacting to noise.",
    },
    {
      num: "04",
      name: "Plan",
      tagline: "Make sure it actually fits.",
      body: "Build a realistic schedule around real meetings, real energy dips, and inevitable surprises.",
    },
    {
      num: "05",
      name: "Execute",
      tagline: "Start the next meaningful action.",
      body: "Stop repeatedly re-deciding what to do. Start one action, stay with it, and let small momentum carry you.",
    },
    {
      num: "06",
      name: "Reflect",
      tagline: "Learn and adjust.",
      body: "See what got done, notice what was postponed, and adjust tomorrow without carrying yesterday's guilt.",
    },
  ];

  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-intention-to-action"}
      aria-labelledby="intention-action-heading"
    >
      {/* Eyebrow in sentence case */}
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6157E8]">
        Behavioral framework
      </p>

      {/* Heading */}
      <h2
        id="intention-action-heading"
        className="mt-4 max-w-[820px] text-[clamp(2.2rem,4.5vw,3.5rem)] font-normal leading-[1.12] tracking-[-0.025em] text-[#151515]"
      >
        From intention to action.
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        The cyclical journey of turning scattered daily thoughts into calm, sustainable execution.
      </p>

      {/* The Diagram: One Horizontal Process Line (Capture → Clarify → Prioritize → Plan → Execute → Reflect) */}
      <div className="mt-16 hidden md:block">
        {/* Horizontal Track with Step Dots */}
        <div className="relative border-t border-[#E8E8E8] pt-8">
          <div className="grid grid-cols-6 gap-6">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              return (
                <div key={step.num} className="relative">
                  {/* Step Connector Label */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#8E8E8A]">
                    <span>{step.num}</span>
                    {!isLast && <span className="text-[#6157E8]/60">→</span>}
                  </div>

                  {/* Step Name */}
                  <h3 className="mt-3 text-lg font-medium text-[#151515]">
                    {step.name}
                  </h3>

                  {/* Tagline */}
                  <p className="mt-1 text-xs font-medium text-[#151515]/80">
                    {step.tagline}
                  </p>

                  {/* Short Body */}
                  <p className="mt-3 text-xs leading-relaxed text-[#666666]">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Flow: Vertical timeline without cards */}
      <div className="mt-12 space-y-8 border-l border-[#E8E8E8] pl-6 md:hidden">
        {steps.map((step) => (
          <div key={step.num} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-2 w-2 rounded-full bg-[#6157E8]" />
            <span className="font-mono text-xs text-[#8E8E8A]">{step.num}</span>
            <h3 className="mt-1 text-base font-medium text-[#151515]">
              {step.name}
            </h3>
            <p className="text-xs font-medium text-[#151515]/80">
              {step.tagline}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#666666]">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
