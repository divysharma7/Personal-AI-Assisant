// src/case-study/products/life-os/custom/PatternEmergence.tsx
//
// Phase 2 — Empathize: Pattern Synthesis.
// First shows raw interview fragments as loose note-like blocks (light purple, white, cream).
// Then shows "What kept showing up" in large, simple typography. No cards required.

import type { CustomSection } from "../../../engine/types";

export function PatternEmergence({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const fragments = [
    {
      text: "“I'll remember it later.”",
      author: "Software engineer, 28",
      bg: "bg-[#F3F0FF] border-[#E8E8E8]",
      rotate: "rotate-[-1deg]",
    },
    {
      text: "“I keep moving this to tomorrow.”",
      author: "Graduate student, 24",
      bg: "bg-white border-[#E8E8E8]",
      rotate: "rotate-[1deg]",
    },
    {
      text: "“My day changes before lunch.”",
      author: "Product manager, 34",
      bg: "bg-[#FFFDF7] border-[#E8E8E8]",
      rotate: "rotate-[-0.8deg]",
    },
    {
      text: "“I don't know which task deserves attention.”",
      author: "Early founder, 26",
      bg: "bg-[#F2F6FF] border-[#E8E8E8]",
      rotate: "rotate-[0.8deg]",
    },
    {
      text: "“I plan more than I can actually finish.”",
      author: "Freelance designer, 29",
      bg: "bg-[#F3F0FF] border-[#E8E8E8]",
      rotate: "rotate-[-1.2deg]",
    },
    {
      text: "“I have 30 things on my list and zero idea what to do right now.”",
      author: "Research analyst, 27",
      bg: "bg-white border-[#E8E8E8]",
      rotate: "rotate-[1.2deg]",
    },
  ];

  const recurringThemes = [
    { name: "Poor planning", note: "Overestimating time and treating 8 hours as uninterrupted execution." },
    { name: "Unclear priorities", note: "When everything feels urgent, deciding what to do becomes exhausting." },
    { name: "Difficulty starting", note: "Vague, intimidating tasks cause dread and prompt avoidance." },
    { name: "Constant replanning", note: "A single delayed meeting causes the entire afternoon to collapse." },
    { name: "Mental overload", note: "Holding commitments across four apps creates constant background noise." },
  ];

  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-pattern-emergence"}
      aria-labelledby="pattern-emergence-heading"
    >
      {/* Eyebrow & Title matching reference */}
      <p className="text-sm font-medium text-[#8E8E8A]">Pattern Synthesis</p>
      <h2
        id="pattern-emergence-heading"
        className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
      >
        connected the dots..
      </h2>

      {/* Narrative Lead */}
      <div className="mt-8 max-w-[720px] space-y-3 text-base leading-relaxed text-[#666666] md:text-lg">
        <p className="font-medium text-[#151515]">
          The same problem kept showing up.
        </p>
        <p>
          People had plenty of tasks. The hard part was deciding which one deserved attention.
          We gathered quotes, daily habits, and frustrations from all eight interviews.
        </p>
      </div>

      {/* Layer 1: Raw Qualitative Fragments (Loose note-like blocks, gentle offsets) */}
      <div className="mt-14 border-t border-[#E8E8E8] pt-12">
        <span className="text-xs font-medium text-[#8E8E8A]">
          Raw interview observations
        </span>

        <div className="mt-8 flex flex-wrap items-start gap-4">
          {fragments.map((frag, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-transform duration-200 hover:rotate-0 hover:shadow-md ${frag.bg} ${frag.rotate} max-w-[320px]`}
            >
              <p className="text-sm font-medium leading-snug text-[#151515]">
                {frag.text}
              </p>
              <span className="mt-2 block text-[11px] font-medium text-[#8E8E8A]">
                {frag.author}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer 2: What Kept Showing Up (Large, simple typography. No cards required) */}
      <div className="mt-20 border-t border-[#E8E8E8] pt-16">
        <h3 className="text-xs font-medium text-[#8E8E8A]">
          What kept showing up
        </h3>

        <div className="mt-8 space-y-8 max-w-[800px]">
          {recurringThemes.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-8 border-b border-[#E8E8E8]/70 pb-6">
              <span className="text-2xl font-medium tracking-tight text-[#151515] sm:w-[260px] shrink-0 md:text-3xl">
                {item.name}
              </span>
              <p className="mt-2 sm:mt-0 text-sm leading-relaxed text-[#666666] md:text-base">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Synthesis Conclusion: The Paradigm Shift */}
      <div className="mt-16 max-w-[760px] rounded-xl border border-[#E8E8E8] bg-white p-8">
        <span className="text-xs font-medium text-[#6157E8]">
          The behavioral realization
        </span>
        <p className="mt-3 text-lg font-normal leading-relaxed text-[#151515]">
          Organizing tasks is not the same as completing them. In fact, organizing often
          becomes covert procrastination.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#666666]">
          Traditional tools help you remember 50 things you are not doing. What people actually
          needed was a system that makes the very next action small, obvious, and remarkably easy
          to begin.
        </p>
      </div>
    </section>
  );
}
