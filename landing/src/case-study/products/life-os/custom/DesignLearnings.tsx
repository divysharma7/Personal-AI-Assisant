// src/case-study/products/life-os/custom/DesignLearnings.tsx
//
// Phase 5 — Learnings & Designer Reflections.
// Light editorial layout: human reflections, intellectual honesty, thin borders,
// calm closure, sentence case, no em dashes.

import type { CustomSection } from "../../../engine/types";

export function DesignLearnings({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const learnings = [
    {
      num: "01",
      title: "The calendar is an illusion of space.",
      reflection:
        "Standard calendars treat all white space equally. But four 20-minute fragments between meetings provide zero capacity for deep work. A productivity system must calculate cognitive focus allowance, not just empty slots.",
    },
    {
      num: "02",
      title: "AI should explain, never act silently.",
      reflection:
        "Autonomous auto-schedulers often feel controlling because users have no idea why their schedule changed. Surfacing clear reasons ('Sprint planning ran over, deferring low-urgency notes') preserves user agency and builds genuine trust.",
    },
    {
      num: "03",
      title: "Organizing is often covert procrastination.",
      reflection:
        "Tinkering with Notion databases, color-coding labels, and setting up nested tags feels like work, but rarely moves a meaningful goal forward. The best productivity system demands almost no upkeep so you can spend your energy on the actual task.",
    },
    {
      num: "04",
      title: "Deferral is a valid decision, not a moral failure.",
      reflection:
        "Traditional to-do apps make unfinished tasks feel like personal guilt. When a tool normalizes shifting priorities and offers guilt-free recalibration, users stay engaged rather than abandoning their system out of shame.",
    },
  ];

  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-learnings"}
      aria-labelledby="learnings-heading"
    >
      {/* Eyebrow & Title matching reference */}
      <p className="text-sm font-medium text-[#8E8E8A]">Key Learnings</p>
      <h2
        id="learnings-heading"
        className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
      >
        What we learned..
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        Productivity is not a logistics problem. It is an emotional and cognitive
        challenge of managing energy, ambiguity, and self-compassion when reality deviates
        from our plans.
      </p>

      {/* 4 Reflection Cards (Clean, unboxed, 1px border) */}
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        {learnings.map((item) => (
          <div
            key={item.num}
            className="flex flex-col justify-between rounded-2xl border border-[#E8E8E8] bg-white p-8"
          >
            <div>
              <span className="font-mono text-xs font-semibold text-[#6157E8]">
                {item.num}
              </span>
              <h3 className="mt-2 text-xl font-medium text-[#151515]">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#666666]">
                {item.reflection}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Final Sign-off Quote (No em dashes) */}
      <div className="mt-16 border-t border-[#E8E8E8] pt-12">
        <div className="max-w-[720px]">
          <p className="text-xl font-medium leading-relaxed text-[#151515] sm:text-2xl sm:leading-relaxed">
            “The goal of Life OS is not to help people do more things in less time.
            It is to make the next meaningful action easier to see and easier to start.”
          </p>
        </div>
      </div>
    </section>
  );
}
