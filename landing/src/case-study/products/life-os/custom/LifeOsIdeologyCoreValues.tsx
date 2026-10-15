// src/case-study/products/life-os/custom/LifeOsIdeologyCoreValues.tsx
//
// Phase 2 — Empathize: "Core values of Life OS"
// Three editorial columns with thin vertical dividers, pale tint on key area, no giant cards, no em dashes.

import type { CustomSection } from "../../../engine/types";

export function LifeOsIdeologyCoreValues({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const values = [
    {
      number: "01",
      title: "Clarity over complexity",
      premise: "Life OS should reduce mental effort, not add to it.",
      explanation:
        "The system helps users understand what matters, what can wait, and what the next action is without forcing them to maintain a complicated setup. The goal is to make fewer, better decisions.",
      principle:
        "If the system requires too much organizing, configuring, or reviewing, it becomes part of the problem.",
    },
    {
      number: "02",
      title: "Action over organization",
      premise: "A perfectly organized task list is useless if nothing moves forward.",
      explanation:
        "Life OS helps users move from 'I need to do this' to 'This is the next concrete step I can actually start.' Tasks should become smaller, priorities clearer, and meaningful work easier to initiate.",
      principle:
        "Success is not how many tasks are stored. Success is whether the user can start, sustain, and finish what matters.",
      highlight: true,
    },
    {
      number: "03",
      title: "Guidance without dependence",
      premise: "Help users make better decisions without making them helpless without the tool.",
      explanation:
        "The system suggests priorities and helps replan when the day breaks. But the user always understands why and stays in control. Over time, it fosters better personal planning habits of their own.",
      principle:
        "The product should reduce executive burden, never replace personal agency.",
    },
  ];

  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-ideology"}
      aria-labelledby="values-heading"
    >
      {/* Eyebrow & Title matching reference */}
      <p className="text-sm font-medium text-[#8E8E8A]">Ideology</p>
      <h2
        id="values-heading"
        className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
      >
        Core values of Life OS
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        Before drawing screens, we codified three non-negotiable principles. Every interaction
        in Life OS is judged against these three standards.
      </p>

      {/* 3 Editorial Columns with Thin Vertical Dividers (No giant bordered cards) */}
      <div className="mt-16 grid grid-cols-1 gap-10 divide-y divide-[#E8E8E8] md:grid-cols-3 md:gap-0 md:divide-y-0 md:divide-x">
        {values.map((v) => (
          <div
            key={v.number}
            className={`pt-8 first:pt-0 md:px-8 md:pt-0 md:first:pl-0 md:last:pr-0 ${
              v.highlight ? "rounded-xl md:bg-[#F3F0FF]/30 md:p-6" : ""
            }`}
          >
            <span className="font-mono text-xs font-semibold text-[#6157E8]">
              {v.number}
            </span>
            <h3 className="mt-2 text-xl font-medium text-[#151515]">
              {v.title}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#151515]/90">
              {v.premise}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#666666]">
              {v.explanation}
            </p>

            <div className="mt-6 border-l-2 border-[#6157E8] pl-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6157E8] block">
                Design principle
              </span>
              <p className="mt-1 text-xs italic text-[#151515] leading-relaxed">
                “{v.principle}”
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
