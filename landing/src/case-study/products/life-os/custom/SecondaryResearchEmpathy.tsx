// src/case-study/products/life-os/custom/SecondaryResearchEmpathy.tsx
//
// Secondary Research Section for Life OS Case Study.
// Exact recreation of the reference portfolio slide:
// - Header: "Secondary Research" eyebrow + bold "So we read, a lot.." title.
// - Left Column: Two green question blocks with 2-column bullet lists,
//   plus terracotta "*Consequences of ignoring" with 3 blush pills.
// - Right Column: Editorial stack of 4 research paper thumbnails and the prominent citation quote.

import type { CustomSection } from "../../../engine/types";

export function SecondaryResearchEmpathy({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="bg-white py-16 md:py-24"
      id={section?.id || "empathize-secondary-research"}
      aria-labelledby="secondary-research-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Eyebrow & Title matching reference */}
        <p className="text-sm font-medium text-[#8E8E8A]">Secondary Research</p>
        <h2
          id="secondary-research-heading"
          className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
        >
          So we read, a lot..
        </h2>

        {/* 2-Column Editorial Grid */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16 md:mt-16">
          {/* Left Column: Challenges, Worsening Factors, Consequences */}
          <div className="space-y-10 lg:col-span-7">
            {/* Block 1: What are these challenges? */}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#48C09B] md:text-2xl">
                What are these challenges?
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm leading-relaxed text-[#374151] sm:grid-cols-2">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>
                      <strong className="font-bold text-[#1F2937]">Procrastination</strong> and
                      avoidance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>
                      <strong className="font-bold text-[#1F2937]">Overwhelming</strong> to-do
                      lists
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Unclear priorities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Difficulty getting started</span>
                  </li>
                </ul>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Erratic work schedules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Constant context switching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Burnout and stress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Attention residue</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Block 2: What makes these struggles worse? */}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#48C09B] md:text-2xl">
                What makes these struggles worse?
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm leading-relaxed text-[#374151] sm:grid-cols-2">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>
                      <strong className="font-bold text-[#1F2937]">
                        Unrealistic daily planning
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>
                      <strong className="font-bold text-[#1F2937]">Overestimating</strong>{" "}
                      available time
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Perfectionism and fear of starting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Vague or unshaped tasks</span>
                  </li>
                </ul>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Poor boundaries around focus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Overwork and meeting overload</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Decision fatigue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#374151]">•</span>
                    <span>Relying on motivation alone</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Block 3: *Consequences of ignoring */}
            <div className="pt-2">
              <h4 className="text-lg font-bold tracking-tight text-[#E07A5F] md:text-xl">
                *Consequences of ignoring
              </h4>
              <div
                className="mt-4 flex flex-wrap items-center gap-3"
                role="list"
                aria-label="Consequences of ignoring execution struggles"
              >
                <div
                  role="listitem"
                  className="rounded-lg bg-[#FEECE6] px-4 py-2.5 text-xs font-normal text-[#27272A] md:text-sm"
                >
                  Damage to self-trust & momentum
                </div>
                <div
                  role="listitem"
                  className="rounded-lg bg-[#FEECE6] px-4 py-2.5 text-xs font-normal text-[#27272A] md:text-sm"
                >
                  Abandoned high-impact goals
                </div>
                <div
                  role="listitem"
                  className="rounded-lg bg-[#FEECE6] px-4 py-2.5 text-xs font-normal text-[#27272A] md:text-sm"
                >
                  Chronic cycle of replanning
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Research Papers Stack & Citation Quote */}
          <div className="space-y-6 lg:col-span-5">
            {/* Top Paper: Full width preview */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="border-b border-[#F3F4F6] pb-2 text-[10px] text-[#9CA3AF]">
                <span>The Practitioner Scholar · Journal of Counseling and Professional Psychology</span>
              </div>
              <h5 className="mt-2 text-xs font-semibold leading-snug text-[#1F2937]">
                Changes in Daily Focus Regarding Professional Practice
              </h5>
              <div className="mt-2 space-y-1.5 text-[9px] leading-relaxed text-[#6B7280]">
                <p>
                  Knowledge workers experience severe cognitive depletion when fragmented by
                  uncontrolled inputs. When tasks lack pre-decided starting conditions, avoidance
                  behaviors emerge within minutes.
                </p>
                <div className="h-1.5 w-3/4 rounded bg-[#F3F4F6]" />
                <div className="h-1.5 w-full rounded bg-[#F3F4F6]" />
                <div className="h-1.5 w-5/6 rounded bg-[#F3F4F6]" />
              </div>
            </div>

            {/* Middle Row: Two Mini Paper Thumbnails side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <span className="block text-[8px] text-[#9CA3AF]">Psychological Bulletin, 2007</span>
                <p className="mt-1 text-[10px] font-semibold text-[#1F2937]">The Nature of Procrastination</p>
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-[#E5E7EB] rounded" />
                  <div className="h-1 w-5/6 bg-[#E5E7EB] rounded" />
                  <div className="h-1 w-4/6 bg-[#E5E7EB] rounded" />
                  <div className="h-1 w-full bg-[#E5E7EB] rounded" />
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <span className="block text-[8px] text-[#9CA3AF]">American Psychologist, 1999</span>
                <p className="mt-1 text-[10px] font-semibold text-[#1F2937]">Implementation Intentions</p>
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-[#E5E7EB] rounded" />
                  <div className="h-1 w-3/4 bg-[#E5E7EB] rounded" />
                  <div className="h-1 w-5/6 bg-[#E5E7EB] rounded" />
                  <div className="h-1 w-2/3 bg-[#E5E7EB] rounded" />
                </div>
              </div>
            </div>

            {/* Bottom Row: Quote on Left, Yellow Highlighted Paper on Right */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
              {/* The Callout Quote */}
              <div className="pr-2">
                <span className="text-xs text-[#6B7280]">A 2015 study cited that</span>
                <blockquote className="mt-1.5 text-sm md:text-[15px] font-bold leading-snug text-[#1F2937]">
                  “A technological intervention is the simplest solution”
                </blockquote>
              </div>

              {/* Bottom Paper with Highlighted Abstract */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <span className="block text-[8px] text-[#9CA3AF]">Behavioral Sciences Research, 2015</span>
                <p className="mt-1 text-[10px] font-semibold text-[#1F2937]">
                  Action Execution Difficulties Faced by Professionals
                </p>
                {/* Yellow Highlighted Abstract Box matching reference */}
                <div className="mt-2 rounded bg-[#FEF08A]/40 p-2 text-[8px] leading-relaxed text-[#713F12] border border-[#FDE047]/60">
                  Despite high intrinsic motivation, self-directed knowledge workers exhibit
                  execution failures when routines fail to absorb real-time daily volatility.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
