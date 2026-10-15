// src/case-study/products/life-os/LifeOsOverviewEditorial.tsx
//
// Human-crafted, editorial case study overview for Life OS.
// Designed with senior product design aesthetics: clean typography, generous whitespace,
// authentic project metadata, genuine designer reflections, and seamless Light / Dark theme support.

import { useState } from "react";
import { Link } from "react-router-dom";

export function LifeOsOverviewEditorial() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const isLight = theme === "light";

  // Dynamic theme-dependent style classes
  const styles = {
    wrapper: isLight
      ? "bg-[#faf9f6] text-zinc-900 transition-colors duration-300"
      : "bg-[#080c14] text-slate-100 transition-colors duration-300",
    surface: isLight
      ? "bg-white border-zinc-200/90 shadow-sm"
      : "bg-[#0e1422] border-white/10 shadow-xl shadow-black/20",
    surfaceAlt: isLight
      ? "bg-[#f4f2ee] border-zinc-200 text-zinc-700"
      : "bg-white/[0.03] border-white/5 text-slate-300",
    border: isLight ? "border-zinc-200" : "border-white/10",
    borderSubtle: isLight ? "border-zinc-200/60" : "border-white/5",
    textPrimary: isLight ? "text-zinc-950" : "text-white",
    textSecondary: isLight ? "text-zinc-600" : "text-slate-400",
    textMuted: isLight ? "text-zinc-400" : "text-slate-500",
    accent: isLight ? "text-indigo-600" : "text-indigo-400",
    accentBg: isLight ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
    emerald: isLight ? "text-emerald-700" : "text-emerald-400",
    coral: isLight ? "text-rose-700" : "text-rose-400",
    amber: isLight ? "text-amber-700" : "text-amber-400",
  };

  return (
    <div className={`min-h-screen ${styles.wrapper}`}>
      {/* ── STICKY EDITORIAL TOOLBAR: Theme Switcher & Case Study Navigator ── */}
      <div className={`sticky top-0 z-40 border-b ${styles.border} backdrop-blur-md ${isLight ? "bg-[#faf9f6]/90" : "bg-[#080c14]/90"}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
              Case Study · Product Design
            </span>
            <span className={`hidden text-xs sm:inline ${styles.textMuted}`}>/</span>
            <span className={`hidden text-xs font-medium sm:inline ${styles.textSecondary}`}>
              Life OS Daily System
            </span>
          </div>

          {/* Hand-crafted Tactile Light / Dark Mode Toggle */}
          <div className={`flex items-center rounded-full border p-1 ${isLight ? "border-zinc-300 bg-zinc-200/60" : "border-white/10 bg-white/5"}`}>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                isLight
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              aria-label="Switch to Light Paper theme"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Paper Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                !isLight
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              aria-label="Switch to Dark Studio theme"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Studio Dark</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-20 lg:py-24">
        {/* ── CHAPTER 01: HERO & PROJECT METADATA ── */}
        <section aria-labelledby="hero-title" className="space-y-8">
          <div className="space-y-4">
            <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
              01 · System Overview
            </p>
            <h1
              id="hero-title"
              className={`text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl ${styles.textPrimary}`}
            >
              Life OS
            </h1>
            <p className={`text-xl font-medium leading-snug sm:text-2xl ${styles.textSecondary}`}>
              Bridging the gap between knowing what needs to be done and actually getting it done.
            </p>
          </div>

          <p className={`max-w-2xl text-base leading-relaxed md:text-lg ${styles.textSecondary}`}>
            Life OS is a personal operating system designed to help self-managing knowledge workers,
            engineers, and creators turn scattered intentions into calm, consistent momentum. Rather than
            adding another intimidating backlog, it reduces the cognitive friction of taking action.
          </p>

          {/* Clean Human Metadata Grid (No corporate fluff) */}
          <div className={`grid grid-cols-2 gap-4 rounded-2xl border p-6 sm:grid-cols-4 ${styles.surface}`}>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${styles.textMuted}`}>Role</p>
              <p className={`mt-1 text-xs font-medium md:text-sm ${styles.textPrimary}`}>
                Product Designer & UX Researcher
              </p>
            </div>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${styles.textMuted}`}>Timeline</p>
              <p className={`mt-1 text-xs font-medium md:text-sm ${styles.textPrimary}`}>
                8 Weeks (0 → 1 Architecture)
              </p>
            </div>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${styles.textMuted}`}>Platform</p>
              <p className={`mt-1 text-xs font-medium md:text-sm ${styles.textPrimary}`}>
                Desktop & Mobile System
              </p>
            </div>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${styles.textMuted}`}>Fieldwork</p>
              <p className={`mt-1 text-xs font-medium md:text-sm ${styles.emerald}`}>
                8 User Interviews · 3 Personas
              </p>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 02: THE EXECUTION PARADOX (RESEARCH EVIDENCE) ── */}
        <section aria-labelledby="paradox-heading" className={`mt-20 border-t pt-16 md:mt-24 ${styles.borderSubtle}`}>
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
              02 · Empirical Grounding
            </p>
            <h2
              id="paradox-heading"
              className={`text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${styles.textPrimary}`}
            >
              If we know what matters, why do we keep putting it off?
            </h2>
            <p className={`max-w-2xl text-sm leading-relaxed md:text-base ${styles.textSecondary}`}>
              You have goals. You make plans. You know what needs to be done. Yet across behavioral psychology
              and attention literature, human follow-through consistently breaks down at predictable fault lines:
            </p>
          </div>

          {/* Three Clean Metric Columns (Human typography, no neon fluff) */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className={`flex flex-col justify-between rounded-2xl border p-6 ${styles.surface}`}>
              <div>
                <span className={`text-3xl font-extrabold tracking-tight md:text-4xl ${styles.emerald}`}>
                  15–20%
                </span>
                <p className={`mt-3 text-sm leading-relaxed ${styles.textSecondary}`}>
                  of adults are estimated to <strong className={`font-semibold ${styles.textPrimary}`}>chronically procrastinate</strong>.
                </p>
              </div>
              <p className={`mt-6 text-xs italic ${styles.textMuted}`}>Steel, 2007</p>
            </div>

            <div className={`flex flex-col justify-between rounded-2xl border p-6 ${styles.surface}`}>
              <div>
                <span className={`text-3xl font-extrabold tracking-tight md:text-4xl ${styles.amber}`}>
                  ~30%
                </span>
                <p className={`mt-3 text-sm leading-relaxed ${styles.textSecondary}`}>
                  of students in one study <strong className={`font-semibold ${styles.textPrimary}`}>finished their thesis by their predicted date</strong>.
                </p>
              </div>
              <p className={`mt-6 text-xs italic ${styles.textMuted}`}>Buehler et al., 1994</p>
            </div>

            <div className={`flex flex-col justify-between rounded-2xl border p-6 ${styles.surface}`}>
              <div>
                <span className={`text-3xl font-extrabold tracking-tight md:text-4xl ${styles.coral}`}>
                  46.9%
                </span>
                <p className={`mt-3 text-sm leading-relaxed ${styles.textSecondary}`}>
                  of waking hours are spent <strong className={`font-semibold ${styles.textPrimary}`}>thinking about something other than the current activity</strong>.
                </p>
              </div>
              <p className={`mt-6 text-xs italic ${styles.textMuted}`}>Killingsworth & Gilbert, 2010</p>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 03: THE EXECUTION GAP (NARRATIVE & CAUSAL FLOW) ── */}
        <section aria-labelledby="gap-heading" className={`mt-20 border-t pt-16 md:mt-24 ${styles.borderSubtle}`}>
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
              03 · Problem Architecture
            </p>
            <h2
              id="gap-heading"
              className={`text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${styles.textPrimary}`}
            >
              The Execution Gap
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
            <div className={`space-y-5 text-base leading-relaxed md:col-span-7 ${styles.textSecondary}`}>
              <p>
                We often know what we need to do, but <strong className={`font-semibold ${styles.textPrimary}`}>knowing doesn't always lead to action</strong>.
                Ideas appear in the middle of other tasks, commitments get buried, and to-do lists keep growing.
                As everything starts to feel important, <strong className={`font-semibold ${styles.textPrimary}`}>deciding what deserves attention becomes an exhausting task in itself</strong>.
              </p>
              <p>
                This is compounded by vague goals, unrealistic plans, constant digital distractions, and the sheer inertia of getting started.
                People can spend an entire day feeling frantically busy without making headway on what truly matters.
              </p>
              <p className={`border-l-2 pl-4 italic ${isLight ? "border-indigo-400 text-zinc-800" : "border-indigo-400 text-slate-200"}`}>
                “Traditional productivity tools help people remember what needs to be done. But remembering is only one part of the challenge. The real barrier is initiating action.”
              </p>
            </div>

            {/* The Domino Chain (Causal breakdown) */}
            <div className={`flex flex-col justify-between rounded-2xl border p-6 md:col-span-5 ${styles.surface}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${styles.textMuted}`}>
                  The Behavioral Domino Effect
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    { step: "01", title: "Scattered Intentions", desc: "Tasks live in chats, notes, and memory" },
                    { step: "02", title: "Overwhelming Priorities", desc: "Urgent demands overshadow deep work" },
                    { step: "03", title: "Delayed Action", desc: "Ambiguity causes avoidance & hesitation" },
                    { step: "04", title: "Stalled Progress", desc: "Guilt compounds as intentions roll over" },
                  ].map((item, idx) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                        idx === 3 ? (isLight ? "bg-rose-100 text-rose-700" : "bg-rose-500/20 text-rose-300") : styles.surfaceAlt
                      }`}>
                        {item.step}
                      </span>
                      <div>
                        <p className={`text-xs font-semibold ${styles.textPrimary}`}>{item.title}</p>
                        <p className={`text-[11px] ${styles.textMuted}`}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`mt-6 border-t pt-3 text-[11px] italic ${styles.borderSubtle} ${styles.textMuted}`}>
                Observed across 8 participant interviews & empirical literature.
              </div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 04: STRATEGIC OPPORTUNITIES ── */}
        <section aria-labelledby="opportunities-heading" className={`mt-20 border-t pt-16 md:mt-24 ${styles.borderSubtle}`}>
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
              04 · Design Opportunities
            </p>
            <h2
              id="opportunities-heading"
              className={`text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${styles.textPrimary}`}
            >
              Rethinking the Role of a Productivity System
            </h2>
            <p className={`max-w-2xl text-sm leading-relaxed md:text-base ${styles.textSecondary}`}>
              Instead of building another place to manage endless lists, Life OS is structured around four
              action-enabling interventions:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                num: "01",
                title: "Reduce mental clutter",
                body: "Frictionless capture that gets ideas out of your head without disrupting your current flow.",
              },
              {
                num: "02",
                title: "Make priorities clearer",
                body: "Context-aware filtering so you see only the vital few tasks rather than an overwhelming backlog.",
              },
              {
                num: "03",
                title: "Make starting easier",
                body: "Break down intimidating objectives into clear, bite-sized next physical steps.",
              },
              {
                num: "04",
                title: "Turn plans into progress",
                body: "Calm daily pacing with built-in reflection loops that eliminate the shame of unfinished work.",
              },
            ].map((opp) => (
              <div key={opp.num} className={`rounded-2xl border p-6 transition-all hover:border-indigo-400/40 ${styles.surface}`}>
                <span className={`text-xs font-bold ${styles.accent}`}>{opp.num}</span>
                <h3 className={`mt-2 text-base font-bold ${styles.textPrimary}`}>{opp.title}</h3>
                <p className={`mt-2 text-xs leading-relaxed md:text-sm ${styles.textSecondary}`}>{opp.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CHAPTER 05: DESIGN PROCESS ROADMAP ── */}
        <section aria-labelledby="process-heading" className={`mt-20 border-t pt-16 md:mt-24 ${styles.borderSubtle}`}>
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
              05 · Methodology
            </p>
            <h2
              id="process-heading"
              className={`text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${styles.textPrimary}`}
            >
              The Design Process
            </h2>
            <p className={`max-w-2xl text-sm leading-relaxed md:text-base ${styles.textSecondary}`}>
              From behavioral inquiry to an actionable operating system:
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {[
              {
                phase: "01",
                name: "Empathize",
                subtitle: "Behavioral Literature & Primary Interviews",
                details: "8 Semi-structured user interviews · 3 Behavioral Personas · 8 Affinity Mapping Clusters.",
                status: "Completed",
                link: "/case-study/life-os/empathize",
              },
              {
                phase: "02",
                name: "Define",
                subtitle: "Problem Framing & The Intention-Action Gap",
                details: "Jobs-to-be-Done · User Journey Mapping · How Might We Statements · Opportunity Areas.",
                status: "Synthesis",
                link: "/case-study/life-os/converge",
              },
              {
                phase: "03",
                name: "Ideate",
                subtitle: "Concept Exploration & System Architecture",
                details: "5 Core Pillars · Task Initiation Frameworks · Cognitive Offloading UI Paradigms.",
                status: "Mapped",
                link: "#ia-map",
              },
              {
                phase: "04",
                name: "Design",
                subtitle: "Design System & High-Fidelity Experience",
                details: "Accessible typography · Dark/Light tokens · Focused execution interfaces · Mobile companion.",
                status: "In Progress",
                link: "/case-study/life-os/solution",
              },
              {
                phase: "05",
                name: "Evaluate",
                subtitle: "Usability Testing & Follow-Through Validation",
                details: "Friction testing · Task completion velocity · Qualitative feedback loops.",
                status: "Planned",
                link: "/case-study/life-os/solution",
              },
            ].map((p) => (
              <div
                key={p.phase}
                className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all md:flex-row md:items-center ${styles.surface}`}
              >
                <div className="flex items-start gap-4">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    p.status === "Completed"
                      ? (isLight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/20 text-emerald-300")
                      : styles.surfaceAlt
                  }`}>
                    {p.phase}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold md:text-base ${styles.textPrimary}`}>{p.name}</h4>
                      <span className={`text-xs ${styles.textMuted}`}>· {p.subtitle}</span>
                    </div>
                    <p className={`mt-1 text-xs ${styles.textSecondary}`}>{p.details}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    p.status === "Completed"
                      ? (isLight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30")
                      : (isLight ? "bg-zinc-100 text-zinc-600" : "bg-white/5 text-slate-400 border border-white/5")
                  }`}>
                    {p.status}
                  </span>
                  {p.link.startsWith("/") ? (
                    <Link
                      to={p.link}
                      className={`text-xs font-medium hover:underline ${styles.accent}`}
                    >
                      Explore phase →
                    </Link>
                  ) : (
                    <span className={`text-xs ${styles.textMuted}`}>Overview below ↓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CHAPTER 06: INFORMATION ARCHITECTURE BLUEPRINT ── */}
        <section id="ia-map" aria-labelledby="ia-heading" className={`mt-20 border-t pt-16 md:mt-24 ${styles.borderSubtle}`}>
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
              06 · System Architecture
            </p>
            <h2
              id="ia-heading"
              className={`text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${styles.textPrimary}`}
            >
              Anatomy of the Life OS System
            </h2>
            <p className={`max-w-2xl text-sm leading-relaxed md:text-base ${styles.textSecondary}`}>
              Structured into five cohesive spaces that accompany the user from morning intention to evening reflection:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "☀️",
                title: "Today",
                purpose: "Single-day execution hub",
                modules: ["Morning Intention Alignment", "Current Focus Step", "Evening Reflection & Close"],
              },
              {
                icon: "✅",
                title: "Tasks & Workflows",
                purpose: "Actionable commitment registry",
                modules: ["Frictionless Quick Capture", "Priority Matrix Triage", "Project Workspaces"],
              },
              {
                icon: "🗓️",
                title: "Calendar & Schedule",
                purpose: "Realistic temporal planning",
                modules: ["Visual Time Blocks", "Bi-directional Calendar Sync", "Disruption Buffer Zones"],
              },
              {
                icon: "🎯",
                title: "Focus & Habits",
                purpose: "Momentum & attention guards",
                modules: ["Distraction-free Focus Timer", "Habit Consistency Loops", "Energy Level Logs"],
              },
              {
                icon: "✨",
                title: "AI Companion",
                purpose: "Intelligent planning co-pilot",
                modules: ["Plan Feasibility Assistant", "Task Clarifier & Breaker", "Weekly Insight Retrospective"],
              },
            ].map((pillar) => (
              <div key={pillar.title} className={`flex flex-col justify-between rounded-2xl border p-5 ${styles.surface}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pillar.icon}</span>
                    <h4 className={`text-sm font-bold ${styles.textPrimary}`}>{pillar.title}</h4>
                  </div>
                  <p className={`mt-1 text-xs italic ${styles.textMuted}`}>{pillar.purpose}</p>

                  <ul className="mt-4 space-y-2">
                    {pillar.modules.map((m) => (
                      <li key={m} className={`flex items-center gap-2 text-xs ${styles.textSecondary}`}>
                        <span className={`h-1 w-1 rounded-full ${isLight ? "bg-zinc-400" : "bg-slate-500"}`} />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CHAPTER 07: CASE STUDY CHAPTER DEEP DIVES ── */}
        <section aria-labelledby="dive-heading" className={`mt-20 border-t pt-16 md:mt-24 ${styles.borderSubtle}`}>
          <div className="space-y-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
              07 · Deep Dives
            </p>
            <h2
              id="dive-heading"
              className={`text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${styles.textPrimary}`}
            >
              Continue Reading the Case Study
            </h2>
            <p className={`max-w-2xl text-sm leading-relaxed md:text-base ${styles.textSecondary}`}>
              Explore the detailed fieldwork, synthesis artifacts, and UX validation:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Link
              to="/case-study/life-os/empathize"
              className={`group flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-emerald-500/50 hover:shadow-lg ${styles.surface}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-widest ${styles.emerald}`}>
                    Phase 02 · Recommended
                  </span>
                  <span className="text-xs font-medium text-emerald-500 transition-transform group-hover:translate-x-1">
                    Explore →
                  </span>
                </div>
                <h3 className={`mt-3 text-lg font-bold ${styles.textPrimary}`}>
                  Empathize & Behavioral Fieldwork
                </h3>
                <p className={`mt-2 text-xs leading-relaxed md:text-sm ${styles.textSecondary}`}>
                  8 qualitative interviews, 8 affinity clusters, and 3 detailed personas (Aarav, Rohan, Neha)
                  dissecting why knowledge workers abandon traditional productivity apps.
                </p>
              </div>
              <div className={`mt-6 flex items-center gap-2 border-t pt-3 text-[11px] font-medium ${styles.borderSubtle} ${styles.emerald}`}>
                <span>Includes 3 Interactive Personas & Affinity Mapping Grid</span>
              </div>
            </Link>

            <Link
              to="/case-study/life-os/discover"
              className={`group flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-indigo-400/50 hover:shadow-lg ${styles.surface}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-widest ${styles.accent}`}>
                    Phase 01 · Background
                  </span>
                  <span className={`text-xs font-medium transition-transform group-hover:translate-x-1 ${styles.accent}`}>
                    Explore →
                  </span>
                </div>
                <h3 className={`mt-3 text-lg font-bold ${styles.textPrimary}`}>
                  Discover & Secondary Literature
                </h3>
                <p className={`mt-2 text-xs leading-relaxed md:text-sm ${styles.textSecondary}`}>
                  Analysis of cognitive offloading, attention fragmentation, and why conventional to-do apps
                  fail under real-world cognitive load.
                </p>
              </div>
              <div className={`mt-6 flex items-center gap-2 border-t pt-3 text-[11px] font-medium ${styles.borderSubtle} ${styles.textMuted}`}>
                <span>Literature review & behavioral economics signals</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── FOOTER: DESIGNER ATTESTATION ── */}
        <footer className={`mt-24 border-t pt-10 text-center text-xs leading-relaxed ${styles.borderSubtle} ${styles.textMuted}`}>
          <p>
            Life OS Case Study · Hand-crafted with React, TypeScript & Tailwind CSS · Designed for calm focus.
          </p>
        </footer>
      </main>
    </div>
  );
}
