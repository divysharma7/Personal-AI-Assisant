// src/case-study/products/life-os/custom/PrimaryResearchEmpathy.tsx
//
// Primary Research Section for Life OS Case Study.
// Exact recreation of the reference portfolio slide:
// - Header: "Primary Research" eyebrow + bold "talked, a lot.." title.
// - Left: "With Whom?" + diversified roles & work styles card + "Who do they turn to?" bullet list.
// - Right: Zoom / Google Meet video call interface with the 8 participant video tiles.
// - Below: The 8 physical research tiles with quotes, experience, and core challenges.

import type { CustomSection } from "../../../engine/types";

interface ParticipantProfile {
  id: string;
  role: string;
  experience: string;
  challenge: string;
  initials: string;
  rotationClass: string;
  quote?: string;
}

const PARTICIPANTS: ParticipantProfile[] = [
  {
    id: "p1",
    role: "Software engineer",
    experience: "5 years",
    challenge: "Side projects keep getting postponed when work drains executive energy.",
    initials: "AM",
    rotationClass: "rotate-[-1deg] md:-translate-y-1",
    quote: "“I know what I want to build. But after eight hours of code reviews, I pick the easiest thing on YouTube instead.”",
  },
  {
    id: "p2",
    role: "Product manager",
    experience: "4 years",
    challenge: "The day changes constantly. Morning plans disintegrate by 11 AM.",
    initials: "NK",
    rotationClass: "rotate-[1.2deg] md:translate-y-2",
    quote: "“Spending 20 minutes planning is useless if a single Slack ping blows up my entire afternoon.”",
  },
  {
    id: "p3",
    role: "Early-stage founder",
    experience: "3 years",
    challenge: "Everything feels urgent. Hard to tell signal from noise.",
    initials: "RS",
    rotationClass: "rotate-[-0.8deg] md:-translate-y-2",
    quote: "“When every task feels like life-or-death, deciding where to start is exhausting.”",
  },
  {
    id: "p4",
    role: "Graduate student",
    experience: "Final year",
    challenge: "Plans more work than available hours allow.",
    initials: "VT",
    rotationClass: "rotate-[1deg] md:translate-y-1",
    quote: "“I write 12 tasks on my list every morning. I finish three and carry nine forward with guilt.”",
  },
  {
    id: "p5",
    role: "Freelance designer",
    experience: "6 years",
    challenge: "Juggling multiple client contexts and variable creative energy.",
    initials: "DL",
    rotationClass: "rotate-[-1.2deg] md:translate-y-2",
    quote: "“Switching between four client Figma files ruins my flow for the rest of the day.”",
  },
  {
    id: "p6",
    role: "Operations lead",
    experience: "7 years",
    challenge: "Back-to-back emergency requests leave no room for strategic tasks.",
    initials: "PS",
    rotationClass: "rotate-[0.8deg] md:-translate-y-1",
    quote: "“I spend all day putting out other people's fires and finish my own work at night.”",
  },
  {
    id: "p7",
    role: "Research analyst",
    experience: "3 years",
    challenge: "Tasks and notes scattered across four different apps.",
    initials: "MK",
    rotationClass: "rotate-[-1deg] md:translate-y-1",
    quote: "“I have notes in Apple Notes, tasks in Notion, and reminders in WhatsApp. Half my effort is checking where things are.”",
  },
  {
    id: "p8",
    role: "Engineering manager",
    experience: "8 years",
    challenge: "Protecting team focus while losing control of own schedule.",
    initials: "AB",
    rotationClass: "rotate-[1.4deg] md:-translate-y-2",
    quote: "“I keep my team unblocked, but my own strategic goals stay stuck at zero.”",
  },
];

export function PrimaryResearchEmpathy({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  return (
    <section
      className="bg-white py-16 md:py-24"
      id={section?.id || "empathize-primary-research"}
      aria-labelledby="empathize-primary-heading"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 lg:px-20">
        {/* Eyebrow & Main Title matching reference */}
        <p className="text-sm font-medium text-[#8E8E8A]">Primary Research</p>
        <h2
          id="empathize-primary-heading"
          className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
        >
          talked, a lot..
        </h2>

        {/* Top 2-Column Section */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14 md:mt-16">
          {/* Left Column: With Whom + Breakdown Card + Support Strategies */}
          <div className="space-y-10 lg:col-span-6">
            {/* With Whom? */}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#48C09B] md:text-2xl">
                With Whom?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#374151] md:text-[15px]">
                We conducted Semi-Structured interviews of 8 knowledge professionals ensuring
                adequate <strong className="font-bold text-[#1F2937]">Diversification</strong>{" "}
                based on qualification, roles, and daily routines.
              </p>

              {/* Diversification Card matching reference layout */}
              <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column: Roles / Qualification */}
                  <div>
                    <h4 className="text-xs font-bold text-[#C084FC]">Qualification & Roles</h4>
                    <ul className="mt-3 space-y-2 text-xs text-[#374151]">
                      <li>
                        <span className="font-medium text-[#1F2937]">Software engineers</span>
                        <span className="block text-[11px] text-[#8E8E8A]">(5+ years exp)</span>
                      </li>
                      <li>
                        <span className="font-medium text-[#1F2937]">Product managers</span>
                        <span className="block text-[11px] text-[#8E8E8A]">(Senior & Associate)</span>
                      </li>
                      <li>
                        <span className="font-medium text-[#1F2937]">Founders & Freelancers</span>
                        <span className="block text-[11px] text-[#8E8E8A]">(Self-managing)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right Column: Workflow Specialization */}
                  <div>
                    <h4 className="text-xs font-bold text-[#C084FC]">Specialization & Routine</h4>
                    <ul className="mt-3 space-y-1.5 text-xs text-[#374151]">
                      <li>• Deep focus + side projects</li>
                      <li>• High meeting context-switching</li>
                      <li>• Competing stakeholder demands</li>
                      <li>• Multiple client workflows</li>
                      <li>• Asynchronous remote schedules</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Who do they turn to? */}
            <div>
              <h3 className="text-xl font-bold leading-snug tracking-tight text-[#48C09B] md:text-2xl">
                Who do they turn to ?
                <br />
                How do they address these isolation and support challenges ?
              </h3>

              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#374151]">
                <li className="flex items-start gap-2">
                  <span className="text-[#374151]">•</span>
                  <span>
                    <strong className="font-bold text-[#1F2937]">Task managers & to-do lists</strong> (Todoist, Notion, Apple Reminders)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#374151]">•</span>
                  <span>
                    <strong className="font-bold text-[#1F2937]">Calendar time-blocking</strong> to defend focus blocks
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#374151]">•</span>
                  <span>Sticky notes and paper notebooks for urgent capture</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#374151]">•</span>
                  <span>Accountability partners and virtual co-working sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#374151]">•</span>
                  <span>Ad-hoc replanning when tasks overflow into the evening</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Zoom / Video Call Grid Interface */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-[#27272A] bg-[#141416] p-3 shadow-xl">
              {/* Call Header */}
              <div className="flex items-center justify-between border-b border-[#27272A] pb-2.5 px-2 text-[11px] text-[#A1A1AA]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-[#E4E4E7]">Primary Research Interviews (8)</span>
                </div>
                <span>45:20</span>
              </div>

              {/* 8-Participant Video Call Grid */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { name: "Aarav M.", role: "SWE, 5y", initials: "AM", bg: "bg-[#2A2B36]" },
                  { name: "Neha K.", role: "Senior PM", initials: "NK", bg: "bg-[#332A36]" },
                  { name: "Rohan S.", role: "APM, 2y", initials: "RS", bg: "bg-[#25332E]" },
                  { name: "Pooja S.", role: "Ops Lead", initials: "PS", bg: "bg-[#362E25]" },
                  { name: "Deepak L.", role: "Designer", initials: "DL", bg: "bg-[#2A3136]" },
                  { name: "Vikram T.", role: "Student", initials: "VT", bg: "bg-[#362A31]" },
                  { name: "Maya K.", role: "Analyst", initials: "MK", bg: "bg-[#2E2A36]" },
                  { name: "Anand B.", role: "Eng Mgr", initials: "AB", bg: "bg-[#253036]" },
                ].map((participant, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-[4/3] rounded-lg ${participant.bg} border border-white/5 p-2 flex flex-col justify-between overflow-hidden shadow-inner`}
                  >
                    {/* Participant Avatar silhouette / Initials */}
                    <div className="mx-auto my-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/90">
                      {participant.initials}
                    </div>

                    {/* Participant Name Badge */}
                    <div className="flex items-center justify-between text-[9px] text-white/80 bg-black/40 -mx-2 -mb-2 px-2 py-1 backdrop-blur-xs">
                      <span className="truncate">{participant.name}</span>
                      <svg className="h-2.5 w-2.5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video Call Controls Bar */}
              <div className="mt-3 flex items-center justify-center gap-3 border-t border-[#27272A] pt-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#27272A] text-white/70">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#27272A] text-white/70">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
                  Leave
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: The 8 Research Desk Tiles with Authentic Participant Insights */}
        <div className="mt-20 border-t border-[#E8E8E8] pt-16">
          <p className="text-sm font-medium text-[#6157E8]">Participant Cohort</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#1F2937] md:text-3xl">
            Eight people, eight different routines
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#666666]">
            Every interview revealed a different breaking point where intentions failed to turn into action.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PARTICIPANTS.map((p) => (
              <div
                key={p.id}
                className={`group relative flex flex-col justify-between rounded-xl border border-[#E8E8E8] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:rotate-0 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-[#6157E8]/40 ${p.rotationClass}`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#E8E8E8]/70 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F0FF] text-xs font-bold text-[#6157E8]">
                      {p.initials}
                    </div>
                    <span className="text-xs font-medium text-[#8E8E8A]">
                      {p.experience}
                    </span>
                  </div>

                  <h4 className="mt-3 text-base font-semibold text-[#151515]">
                    {p.role}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-[#666666]">
                    {p.challenge}
                  </p>
                </div>

                {p.quote && (
                  <div className="mt-4 border-t border-[#E8E8E8]/70 pt-3">
                    <p className="text-[11px] italic leading-relaxed text-[#8E8E8A]">
                      {p.quote}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
