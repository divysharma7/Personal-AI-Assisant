import {
  CheckCircle2,
  Clock,
  BellOff,
  MoreHorizontal,
  ArrowRight,
  Sun,
} from "lucide-react";
import "./light-visual.css";

/**
 * Tiny bespoke sunrise symbol beside "Tomorrow ready" (24px × 14px)
 */
function TinySunrise() {
  return (
    <svg
      className="ritual-tomorrow__sunrise-svg"
      viewBox="0 0 24 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="11" r="5.5" fill="#f59e0b" opacity="0.9" />
      <line
        x1="1"
        y1="13"
        x2="23"
        y2="13"
        stroke="#d97706"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * LightVisual: "The Life OS Daily Rhythm"
 * Directly proves the marketing copy:
 *   "Plan around the time you actually have, stay with what matters,
 *    then close the day knowing what's done and what's next."
 *
 * The Ritual Journey:
 *   01. MORNING (8:30 AM): Plan around real capacity (6h 20m available · 3 priorities)
 *   02. FOCUS HERO (11:20 AM): Stay with what matters (42:18 active timer · notifications held)
 *   03. EVENING (5:45 PM): Close the day (completed work + carry-forward)
 *   04. TOMORROW: Tomorrow ready with less to rebuild
 */
export function LightVisual() {
  return (
    <div
      className="ritual-stage"
      role="region"
      aria-label="The Life OS Daily Rhythm: Plan around real capacity, protect focus, close loops, and prepare tomorrow"
    >
      {/* ── 1. FLUID S-CURVE CONTINUOUS DAY PATH (SVG) ── */}
      <svg
        className="ritual-path-svg"
        viewBox="0 0 1000 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ritualPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#22c55e" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Continuous organic trajectory connecting Morning → Focus → Evening → Tomorrow */}
        <path
          d="M 120 180 C 230 180, 270 270, 390 270 S 580 230, 680 230 S 810 300, 920 300"
          stroke="url(#ritualPathGrad)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Anchored Stage Milestone Dots */}
        <circle cx="120" cy="180" r="4.5" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
        <circle cx="420" cy="268" r="6" fill="#ffffff" stroke="#22c55e" strokeWidth="2.5" />
        <circle cx="700" cy="230" r="4.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="920" cy="300" r="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
      </svg>

      {/* ── 2. DESKTOP RITUAL FLOW CANVAS ── */}
      <div className="ritual-flow-canvas">
        {/* ── MOMENT 01: PLAN AROUND REAL CAPACITY (22% Weight) ── */}
        <div className="ritual-moment ritual-moment--morning">
          <div className="ritual-moment__meta">
            <span className="ritual-moment__time">8:30 AM</span>
            <span className="ritual-moment__tag ritual-moment__tag--purple">Plan</span>
          </div>

          <div className="ritual-card ritual-card--morning">
            <div className="ritual-morning__top">
              <h4 className="ritual-morning__title">
                <Sun size={12} style={{ color: "#f59e0b" }} aria-hidden="true" />
                Good morning
              </h4>
              <MoreHorizontal size={12} style={{ color: "#94a3b8" }} aria-hidden="true" />
            </div>

            {/* Direct proof of "Plan around the time you actually have" */}
            <div className="ritual-morning__capacity-pill">
              <Clock size={10} aria-hidden="true" />
              <span>6h 20m available today</span>
            </div>

            <p className="ritual-morning__sub">3 priorities chosen</p>

            <div className="ritual-morning__tasks">
              <div className="ritual-morning__task-row ritual-morning__task-row--top">
                <div className="ritual-morning__task-left">
                  <span className="ritual-morning__radio" aria-hidden="true" />
                  <span>Finish launch brief</span>
                </div>
                <span className="ritual-morning__badge">Top priority</span>
              </div>

              <div className="ritual-morning__task-row">
                <div className="ritual-morning__task-left">
                  <span className="ritual-morning__radio" aria-hidden="true" />
                  <span>Review analytics</span>
                </div>
              </div>

              <div className="ritual-morning__task-row">
                <div className="ritual-morning__task-left">
                  <span className="ritual-morning__radio" aria-hidden="true" />
                  <span>Prepare team sync</span>
                </div>
              </div>
            </div>

            <div className="ritual-morning__footer">
              <span>2 meetings considered</span>
            </div>
          </div>

          <p className="ritual-moment__microcopy ritual-moment__microcopy--purple">
            Plan around reality.
          </p>
        </div>

        {/* ── MOMENT 02: FOCUS HERO (STAY WITH WHAT MATTERS - 38% Weight) ── */}
        <div className="ritual-moment ritual-moment--focus">
          <div className="ritual-moment__meta">
            <span className="ritual-moment__time">11:20 AM</span>
            <span className="ritual-moment__tag ritual-moment__tag--green">Focus Hero</span>
          </div>

          <div className="ritual-card ritual-card--focus">
            <div className="ritual-focus__top">
              <div className="ritual-focus__active-label">
                <span className="ritual-focus__dot" aria-hidden="true" />
                <span>Focus active</span>
              </div>
              <span className="ritual-focus__badge">Deep work</span>
            </div>

            {/* Dominant 42px timer - The visual anchor */}
            <div className="ritual-focus__timer" aria-label="Focus timer: 42 minutes 18 seconds">
              42:18
            </div>

            <p className="ritual-focus__task-name">Writing launch brief</p>

            <div className="ritual-focus__footer">
              <div className="ritual-focus__footer-left">
                <BellOff size={10} aria-hidden="true" />
                <span>Notifications held</span>
              </div>
              <span>Started 10:38</span>
            </div>
          </div>

          <p className="ritual-moment__microcopy ritual-moment__microcopy--green">
            One thing at a time.
          </p>
        </div>

        {/* ── MOMENT 03: CLOSE THE LOOP (25% Weight) ── */}
        <div className="ritual-moment ritual-moment--evening">
          <div className="ritual-moment__meta">
            <span className="ritual-moment__time">5:45 PM</span>
            <span className="ritual-moment__tag ritual-moment__tag--amber">Close</span>
          </div>

          <div className="ritual-card ritual-card--evening">
            <div className="ritual-evening__top">
              <h4 className="ritual-evening__title">Today</h4>
              <span style={{ fontSize: 9.5, color: "#16a34a", fontWeight: 600 }}>3 done</span>
            </div>

            {/* Proof of "knowing what's done" */}
            <div className="ritual-evening__done-list">
              <div className="ritual-evening__done-item">
                <CheckCircle2 size={11} className="ritual-evening__check-icon" aria-hidden="true" />
                <span>Launch brief</span>
              </div>
              <div className="ritual-evening__done-item">
                <CheckCircle2 size={11} className="ritual-evening__check-icon" aria-hidden="true" />
                <span>Review analytics</span>
              </div>
              <div className="ritual-evening__done-item">
                <CheckCircle2 size={11} className="ritual-evening__check-icon" aria-hidden="true" />
                <span>30 min workout</span>
              </div>
            </div>

            {/* Proof of "and what's next" (Carry forward) */}
            <div className="ritual-evening__carry">
              <div className="ritual-evening__carry-header">
                <ArrowRight size={9} aria-hidden="true" />
                <span>Carry forward</span>
              </div>
              <div className="ritual-evening__carry-item">
                <span className="ritual-evening__carry-dot" aria-hidden="true" />
                <span>Update onboarding copy</span>
              </div>
            </div>
          </div>

          <p className="ritual-moment__microcopy ritual-moment__microcopy--amber">
            Know what's done. Know what can wait.
          </p>
        </div>

        {/* ── MOMENT 04: TOMORROW READY (15% Weight) ── */}
        <div className="ritual-moment ritual-moment--tomorrow">
          <div className="ritual-tomorrow">
            <h3 className="ritual-tomorrow__headline">
              Tomorrow is
              <br />
              already lighter.
            </h3>
            <p className="ritual-tomorrow__sub">
              What matters carries forward automatically.
            </p>
            <div className="ritual-tomorrow__badge">
              <TinySunrise />
              <span>Ready when you are</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}