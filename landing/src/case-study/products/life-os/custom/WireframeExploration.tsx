// src/case-study/products/life-os/custom/WireframeExploration.tsx
//
// Phase 4: Wireframe Exploration and Low-Fidelity Testing.
// Light editorial layout: architectural wireframes, variant trade-offs, sentence case, no em dashes.

import type { CustomSection } from "../../../engine/types";

export function WireframeExploration({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-wireframes"}
      aria-labelledby="wireframes-heading"
    >
      {/* Eyebrow in sentence case */}
      <p className="text-sm font-medium text-[#6157E8]">
        Low-fidelity exploration
      </p>

      {/* Heading */}
      <h2
        id="wireframes-heading"
        className="mt-4 max-w-[820px] text-[clamp(2.2rem,4.5vw,3.5rem)] font-normal leading-[1.12] tracking-[-0.025em] text-[#151515]"
      >
        Testing the mechanics before styling pixels.
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        Before committing to visual design, we wireframed three distinct structural models
        to determine how a user should experience disruption and replanning.
      </p>

      {/* 3 Wireframe Architecture Variants */}
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Variant A */}
        <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
            <span className="text-xs font-semibold text-[#8E8E8A]">
              Concept A
            </span>
            <span className="text-xs font-medium text-[#8E8E8A]">
              Baseline
            </span>
          </div>
          <h3 className="mt-3 text-base font-medium text-[#151515]">
            Manual capacity worksheet
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#666666]">
            Shows raw available minutes and lets the user drag-and-drop tasks manually when
            meetings overrun.
          </p>
          <div className="mt-6 rounded-lg border border-dashed border-[#E8E8E8] bg-[#FAFAFA] p-3 text-[11px] text-[#666666]">
            <strong className="text-[#151515]">Verdict:</strong> Too much friction. On high-chaos
            days, users abandon manual math and stop updating the app.
          </div>
        </div>

        {/* Variant B (Chosen) */}
        <div className="rounded-xl border border-[#6157E8]/50 bg-[#F3F0FF]/30 p-6 shadow-[0_2px_12px_rgba(97,87,232,0.04)]">
          <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
            <span className="text-xs font-semibold text-[#6157E8]">
              Concept B
            </span>
            <span className="text-xs font-medium text-[#6157E8]">
              Preferred model
            </span>
          </div>
          <h3 className="mt-3 text-base font-medium text-[#151515]">
            Reviewed repair proposal
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#666666]">
            The system detects the deficit, calculates the minimal trade-off, and presents
            a 4-part card: Trigger, Reason, Consequence, and Control.
          </p>
          <div className="mt-6 rounded-lg border border-[#6157E8]/30 bg-white p-3 text-[11px] text-[#151515]">
            <strong className="text-[#6157E8]">Verdict:</strong> Preserves user agency while
            saving 15 minutes of manual re-planning per afternoon.
          </div>
        </div>

        {/* Variant C */}
        <div className="rounded-xl border border-[#E8E8E8] bg-white p-6 opacity-75">
          <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
            <span className="text-xs font-semibold text-[#8E8E8A]">
              Concept C
            </span>
            <span className="text-xs font-medium text-[#8E8E8A]">
              Rejected
            </span>
          </div>
          <h3 className="mt-3 text-base font-medium text-[#151515]">
            Autonomous auto-reshuffle
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#666666]">
            AI silently reschedules tasks across calendars in real-time without asking
            confirmation.
          </p>
          <div className="mt-6 rounded-lg border border-dashed border-[#E8E8E8] bg-[#FAFAFA] p-3 text-[11px] text-[#666666]">
            <strong className="text-[#151515]">Verdict:</strong> Severely damages user trust.
            Moving commitments silently makes users feel out of control of their own lives.
          </div>
        </div>
      </div>

      {/* Low-Fidelity Wireframe Blueprint Box */}
      <div className="mt-14 rounded-2xl border border-[#E8E8E8] bg-white p-8 md:p-12">
        <div className="border-b border-[#E8E8E8] pb-4">
          <span className="text-xs font-medium text-[#6157E8]">
            Architecture blueprint
          </span>
          <p className="mt-1 text-sm text-[#666666]">
            Visualizing the core view hierarchy: Capacity meter, Active next step, Adaptive repair proposal.
          </p>
        </div>

        {/* Wireframe Mock Canvas */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Wireframe Column 1: Daily View Wireframe */}
          <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-5 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-2 text-[11px] text-[#8E8E8A]">
              <span>Today. Wireframe layout</span>
              <span>185 focus minutes available</span>
            </div>

            {/* Wireframe Blocks */}
            <div className="mt-4 space-y-3">
              <div className="h-9 rounded-lg border border-[#E8E8E8] bg-white px-3 flex items-center justify-between text-xs text-[#8E8E8A]">
                <span>Fixed meeting: Team sync</span>
                <span>10:00 to 10:45 AM</span>
              </div>
              <div className="h-16 rounded-lg border-2 border-[#6157E8]/40 bg-white px-4 py-2 text-xs">
                <div className="flex items-center justify-between font-medium text-[#151515]">
                  <span>Active next action: Design system specs</span>
                  <span className="text-[10px] text-[#6157E8]">In progress (45m)</span>
                </div>
                <p className="text-[10px] text-[#8E8E8A] mt-1">
                  One-tap start. Zero context switching.
                </p>
              </div>
              <div className="h-9 rounded-lg border border-[#E8E8E8] bg-white px-3 flex items-center justify-between text-xs text-[#8E8E8A]">
                <span>Firm routine: Evening workout</span>
                <span className="text-[10px] text-[#8E8E8A]">[Firm] 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Wireframe Column 2: Repair Proposal Card */}
          <div className="rounded-xl border border-[#E8E8E8] bg-white p-5 lg:col-span-5">
            <span className="text-xs font-medium text-[#6157E8]">
              Proposed repair card
            </span>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="rounded-lg bg-[#FAFAFA] p-2.5 border border-[#E8E8E8]">
                <span className="block text-xs font-medium text-[#8E8E8A]">Trigger</span>
                <span className="text-[#151515]">Sprint planning ran 30 minutes over.</span>
              </div>
              <div className="rounded-lg bg-[#FAFAFA] p-2.5 border border-[#E8E8E8]">
                <span className="block text-xs font-medium text-[#8E8E8A]">Proposed action</span>
                <span className="text-[#151515]">Defer review analytics to tomorrow (no hard deadline today).</span>
              </div>
              <div className="rounded-lg bg-[#FAFAFA] p-2.5 border border-[#E8E8E8]">
                <span className="block text-xs font-medium text-[#8E8E8A]">Protected</span>
                <span className="text-[#151515]">Portfolio polish and evening workout remain intact.</span>
              </div>
              <div className="mt-4 flex gap-2 pt-2">
                <div className="flex-1 rounded-lg border border-[#6157E8] bg-[#6157E8] py-1.5 text-center text-xs font-medium text-white">
                  Accept repair
                </div>
                <div className="flex-1 rounded-lg border border-[#E8E8E8] bg-white py-1.5 text-center text-xs text-[#666666]">
                  Dismiss
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
