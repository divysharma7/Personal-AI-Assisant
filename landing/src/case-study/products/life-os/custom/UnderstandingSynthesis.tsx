// src/case-study/products/life-os/custom/UnderstandingSynthesis.tsx
//
// Understanding / Literature & Behavioral Synthesis for Life OS Case Study.
// Exact recreation of the reference portfolio slide:
// - Header: "Understanding" eyebrow + bold "studied, a lot.." title.
// - Left: "Why Cognitive Scaffolding?" + "The Execution Feedback Loop" with 2-column bullets.
// - Right: Three-arch yellow framed collaborative graphic + 76% research citation quote.
// - Bottom: "Flow of the System" with 6 sequential soft mint cards (01 to 06) connected by arrows.

import type { CustomSection } from "../../../engine/types";

export function UnderstandingSynthesis({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const systemFlow = [
    {
      num: "01.",
      title: "Capture",
      desc: "In an initial quick round, record raw commitments and ideas without cluttering mental working memory.",
    },
    {
      num: "02.",
      title: "Clarify",
      desc: "Outline active projects and break vague tasks down until the very first concrete step is observable.",
    },
    {
      num: "03.",
      title: "Key Question",
      desc: "Reflect on the central priority: What single high-impact action moves the needle today?",
    },
    {
      num: "04.",
      title: "Plan",
      desc: "Align intended focus blocks with real calendar constraints and realistic available energy.",
    },
    {
      num: "05.",
      title: "Action Plan",
      desc: "Lock in the immediate next micro-step and execute with one tap without second-guessing.",
    },
    {
      num: "06.",
      title: "Follow-Up",
      desc: "Check in at day's end on what worked, absorb disruptions, and adapt tomorrow without guilt.",
    },
  ];

  return (
    <section
      className="bg-white py-16 md:py-24"
      id={section?.id || "empathize-understanding-synthesis"}
      aria-labelledby="understanding-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Eyebrow & Main Title matching reference */}
        <p className="text-sm font-medium text-[#8E8E8A]">Understanding</p>
        <h2
          id="understanding-heading"
          className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
        >
          studied, a lot..
        </h2>

        {/* Top 2-Column Section */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14 md:mt-16">
          {/* Left Column: Why Scaffolding + The Execution Feedback Loop */}
          <div className="space-y-10 lg:col-span-7">
            {/* Block 1: Why Cognitive Scaffolding? */}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#48C09B] md:text-2xl">
                Why Cognitive Scaffolding?
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#374151] md:text-[15px]">
                <p>
                  Leveraging cognitive scaffolding and lightweight routines has proved to be a
                  highly effective method.
                </p>
                <p>
                  <strong className="font-bold text-[#1F2937]">
                    Connecting daily intentions with immediate next actions
                  </strong>{" "}
                  can provide valuable clarity, reduce decision fatigue, and dissolve the initial
                  inertia of getting started.
                </p>
              </div>
            </div>

            {/* Block 2: The Execution Feedback Loop */}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#48C09B] md:text-2xl">
                The Execution Feedback Loop
              </h3>
              <p className="mt-3 text-sm text-[#4B5563]">
                Daily system check-ins are structured moments where users engage with their routine to:
              </p>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm leading-relaxed text-[#374151] sm:grid-cols-2">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>discuss difficult and ambiguous cases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>conclude a clear direction to follow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>figure out possible starting solutions</span>
                  </li>
                </ul>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>provide cognitive validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>protect dedicated focus blocks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>exchange overwhelm for momentum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>collaboratively adapt when plans shift</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Three-Arch Yellow Window Graphic + 76% Citation Quote */}
          <div className="lg:col-span-5">
            {/* Arched Window Graphic Frame matching reference */}
            <div className="relative overflow-hidden rounded-3xl bg-[#FEF9C3] p-6 shadow-md border border-[#FDE047]/60">
              {/* Three Yellow Arches Silhouette */}
              <div className="relative flex justify-center items-end gap-2 h-56 md:h-64">
                <div className="h-full w-24 rounded-t-full bg-[#FACC15] opacity-90" />
                <div className="h-full w-28 rounded-t-full bg-[#EAB308] opacity-95 shadow-sm" />
                <div className="h-full w-24 rounded-t-full bg-[#FACC15] opacity-90" />

                {/* Conceptual focus workspace overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/15 backdrop-blur-[0.5px] rounded-2xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#1F2937] shadow-md">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white drop-shadow-sm">
                    Empirical Focus Scaffolding
                  </p>
                  <p className="mt-1 text-[11px] text-white/90 max-w-[200px] leading-snug drop-shadow-sm">
                    Structured routines turning scattered intentions into observable execution.
                  </p>
                </div>
              </div>
            </div>

            {/* Citation Quote below graphic */}
            <div className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-[#6B7280]">
              <svg
                className="h-4 w-4 shrink-0 text-[#9CA3AF] mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="italic">
                <strong className="font-semibold text-[#1F2937] not-italic">76% of professionals</strong> who
                engaged in structured daily scaffolding reported improved execution competence and confidence
                in their routine. <span className="not-italic text-[#9CA3AF]">(Survey by Cognitive Ergonomics Research)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Flow of the System (6 Sequential Soft Mint Cards) */}
        <div className="mt-20 border-t border-[#E8E8E8] pt-14">
          <h4 className="text-base font-bold tracking-tight text-[#1F2937] md:text-lg">
            Flow of the System
          </h4>

          {/* 6 Step Cards connected by arrows */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-2.5">
            {systemFlow.map((step, idx) => {
              const isLast = idx === systemFlow.length - 1;
              return (
                <div key={step.num} className="relative flex flex-col">
                  {/* Soft Mint Card */}
                  <div className="rounded-xl border border-[#D1FAE5] bg-[#E8F8F5] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#48C09B]">
                        {step.num}
                      </span>
                      <h5 className="mt-1 text-sm font-bold text-[#1F2937]">
                        {step.title}
                      </h5>
                    </div>

                    {!isLast && (
                      <div className="hidden lg:block absolute -right-2 top-6 z-10 text-xs text-[#9CA3AF]">
                        →
                      </div>
                    )}
                  </div>

                  {/* Micro-copy underneath card */}
                  <p className="mt-2.5 text-[11px] leading-relaxed text-[#6B7280]">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
