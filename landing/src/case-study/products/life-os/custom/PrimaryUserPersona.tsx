// src/case-study/products/life-os/custom/PrimaryUserPersona.tsx
//
// Phase 2 — Empathize: User Personas.
// Light editorial layout: one large avatar, quote on pale purple tint (#F3F0FF),
// thin column separators, no nested cards, sentence case, no em dashes.

import { useState } from "react";
import type { CustomSection } from "../../../engine/types";

interface PersonaProfile {
  id: string;
  name: string;
  age: string;
  role: string;
  context: string;
  location: string;
  avatarSrc: string;
  quote: string;
  wants: string[];
  obstacles: string[];
  feels: string[];
  does: string[];
}

const PERSONAS: PersonaProfile[] = [
  {
    id: "aarav",
    name: "Aarav",
    age: "28",
    role: "Software engineer",
    context: "Full-time professional building side projects",
    location: "Bengaluru, India",
    avatarSrc: "/case-study/persona_aarav_mehta.jpg",
    quote:
      "“I know exactly what I want to achieve. But by the end of the day, I have been busy with everything except the things that actually matter to me.”",
    wants: [
      "Make consistent daily progress on personal goals.",
      "Spend less time configuring productivity tools.",
      "Know what to work on next without re-deciding priorities.",
      "Build a realistic routine that survives interruptions.",
    ],
    obstacles: [
      "Struggles to prioritize when multiple tasks feel urgent.",
      "Overplans the day, regularly underestimating deep work duration.",
      "Procrastinates on personal goals when tasks feel too large.",
      "Derails when Slack messages interrupt planned focus blocks.",
    ],
    feels: [
      "Overwhelmed when the to-do list grows longer each morning.",
      "Guilty about repeatedly moving unfinished tasks to tomorrow.",
      "Frustrated when distractions interrupt planned focus.",
      "Energized by visible momentum and small completed steps.",
    ],
    does: [
      "Uses a task manager, calendar, and notes apps concurrently.",
      "Creates ambitious morning plans but rolls tasks over by evening.",
      "Knocks out quick, easy tasks first to feel productive.",
      "Works on side projects only when spare time appears.",
    ],
  },
  {
    id: "rohan",
    name: "Rohan",
    age: "26",
    role: "Associate product manager",
    context: "Full-time professional and aspiring founder",
    location: "Mumbai, India",
    avatarSrc: "/case-study/persona_rohan_sharma.jpg",
    quote:
      "“I make a to-do list every morning, but somehow the important things keep getting pushed to tomorrow.”",
    wants: [
      "Feel genuinely in control of daily responsibilities.",
      "Make steady progress toward career and startup goals.",
      "Spend less time planning and more time executing.",
      "Build sustainable habits without rigid setups.",
    ],
    obstacles: [
      "Confuses being busy with being productive, reacting to messages all day.",
      "Struggles to identify what matters when everything competes for attention.",
      "Plans 8 hours of work in an 8-hour day with zero buffer.",
      "Abandons productivity apps when upkeep starts feeling like homework.",
    ],
    feels: [
      "Overwhelmed when unexpected fires disrupt planned work.",
      "Frustrated when another week slips by without core progress.",
      "Guilty about delaying high-leverage side projects.",
      "Motivated when completing something tangible.",
    ],
    does: [
      "Writes daily to-dos but rarely reviews what was left behind.",
      "Responds to urgent pings first, even when unimportant.",
      "Jots thoughts across WhatsApp self-chats and Apple Notes.",
      "Waits for free time or sudden motivation before starting.",
    ],
  },
  {
    id: "neha",
    name: "Neha",
    age: "34",
    role: "Senior product manager",
    context: "Managing multiple stakeholders and high context switching",
    location: "Gurugram, India",
    avatarSrc: "/case-study/persona_neha_kapoor.jpg",
    quote:
      "“I already have a calendar, notes, and three task lists. Why would I want another app that demands 20 minutes of daily upkeep?”",
    wants: [
      "Stay on top of responsibilities without extra administrative work.",
      "Protect dedicated time for strategic thinking.",
      "Reduce decision fatigue throughout the day.",
      "Re-plan quickly when priorities shift without starting over.",
    ],
    obstacles: [
      "Constantly switches contexts between meetings, leaving zero focus blocks.",
      "Overwhelmed by competing demands from multiple stakeholders.",
      "Plans break down by 11 AM due to sudden urgent requests.",
      "Finds maintaining task managers exhausting when they require manual upkeep.",
    ],
    feels: [
      "Skeptical of productivity tools promising magical transformations.",
      "Exhausted by complex workflows and redundant notifications.",
      "Mentally drained after back-to-back decision-heavy days.",
      "Relieved when progress happens without extra overhead.",
    ],
    does: [
      "Relies on calendar time-blocking and quick scratchpad notes.",
      "Handles stakeholder fires immediately to unblock teams.",
      "Abandons tools that demand more than 2 minutes of daily upkeep.",
      "Relies on experience and intuition to prioritize on the fly.",
    ],
  },
];

export function PrimaryUserPersona({
  section,
}: {
  data?: unknown;
  section?: CustomSection;
} = {}) {
  const [activeId, setActiveId] = useState("aarav");
  const current = PERSONAS.find((p) => p.id === activeId) || PERSONAS[0];

  return (
    <section
      className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-14 py-16 md:py-24"
      id={section?.id || "empathize-personas"}
      aria-labelledby="personas-heading"
    >
      {/* Eyebrow & Title matching reference */}
      <p className="text-sm font-medium text-[#8E8E8A]">Personas</p>
      <h2
        id="personas-heading"
        className="mt-2 text-[32px] font-bold tracking-tight text-[#1F2937] md:text-[40px]"
      >
        Who are my primary users?
      </h2>
      <p className="mt-5 max-w-[720px] text-base leading-relaxed text-[#666666] md:text-lg">
        Three distinct archetypes emerged from user research. Each struggled with the
        intention-action gap for different reasons.
      </p>

      {/* Simple Text Persona Selector */}
      <div className="mt-12 flex flex-wrap items-center gap-3 border-b border-[#E8E8E8] pb-4">
        {PERSONAS.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`rounded-lg px-4 py-2 text-sm transition-all ${
                isActive
                  ? "bg-[#F3F0FF] font-medium text-[#6157E8]"
                  : "text-[#666666] hover:text-[#151515]"
              }`}
            >
              {p.name}
              <span className="ml-2 text-xs text-[#8E8E8A]">· {p.role}</span>
            </button>
          );
        })}
      </div>

      {/* Persona Overview: Large Avatar & Quote Area with Pale Purple Tint */}
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
        {/* Large Portrait Avatar (3 cols) */}
        <div className="md:col-span-3">
          <div className="aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl border border-[#E8E8E8] bg-[#F3F0FF]">
            <img
              src={current.avatarSrc}
              alt={current.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Name, Role & Pale Purple Quote Box (9 cols) */}
        <div className="space-y-4 md:col-span-9">
          <div>
            <h3 className="text-2xl font-medium text-[#151515]">
              {current.name}
            </h3>
            <p className="text-sm text-[#666666]">
              {current.role}, {current.age} · {current.location}
            </p>
            <p className="text-xs text-[#8E8E8A]">
              {current.context}
            </p>
          </div>

          {/* Pale Tint Behind Quote Area */}
          <div className="rounded-xl border border-[#E8E8E8] bg-[#F3F0FF] p-5">
            <p className="text-base italic leading-relaxed text-[#151515]">
              {current.quote}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Simple Columns with Thin Separators (No nested cards) */}
      <div className="mt-14 grid grid-cols-1 gap-8 border-t border-[#E8E8E8] pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#E8E8E8]">
        {/* What he wants */}
        <div className="lg:pr-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
            What they want
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#666666]">
            {current.wants.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#6157E8]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What gets in the way */}
        <div className="lg:px-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
            What gets in the way
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#666666]">
            {current.obstacles.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8E8E8A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Feels */}
        <div className="lg:px-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
            Feels
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#666666]">
            {current.feels.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8E8E8A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Does */}
        <div className="lg:pl-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#151515]">
            What they do today
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#666666]">
            {current.does.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#151515]/40" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
