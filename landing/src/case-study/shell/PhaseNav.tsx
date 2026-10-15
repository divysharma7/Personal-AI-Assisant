// src/case-study/shell/PhaseNav.tsx
//
// Simple editorial chapter navigation for Life OS Case Study.
// Plain text links, sentence case, thin bottom border, purple active underline.

import { useState } from "react";

const navSections = [
  { id: "overview-execution-gap", label: "Overview" },
  { id: "overview-execution-paradox", label: "Problem" },
  { id: "overview-process-timeline", label: "Process" },
  { id: "empathize-secondary-research", label: "Research" },
  { id: "empathize-primary-research", label: "Interviews" },
  { id: "empathize-understanding-synthesis", label: "Synthesis" },
  { id: "empathize-affinity-mapping", label: "Affinity map" },
  { id: "empathize-personas", label: "Personas" },
  { id: "empathize-user-journey", label: "Journey" },
  { id: "empathize-pain-points", label: "Pain points" },
  { id: "empathize-competitor-analysis", label: "Competition" },
  { id: "empathize-pyramid-search", label: "Analogies" },
  { id: "empathize-ideology", label: "Principles" },
  { id: "empathize-brief-hmw", label: "Ideation" },
  { id: "empathize-learnings", label: "Key learnings" },
];

export function PhaseNav() {
  const [activeId, setActiveId] = useState<string>("empathize-secondary-research");

  const scrollToSection = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      aria-label="Case study chapters"
      className="sticky top-16 z-30 border-b border-[#E8E8E8] bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14">
        <div className="flex items-center gap-7 overflow-x-auto py-3.5 no-scrollbar sm:gap-8">
          {navSections.map((sec) => {
            const isActive = activeId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`relative whitespace-nowrap py-1 text-xs transition-colors sm:text-sm ${
                  isActive
                    ? "font-medium text-[#6157E8]"
                    : "text-[#666666] hover:text-[#151515]"
                }`}
              >
                <span>{sec.label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-[15px] left-0 right-0 h-[2px] bg-[#6157E8]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
