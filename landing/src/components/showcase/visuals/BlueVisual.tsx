import {
  Check,
  CheckCircle2,
  Sparkles,
  Flame,
  Bell,
  Clock,
  Calendar,
} from "lucide-react";
import "./blue-visual.css";

/**
 * 3D Physical Product Tokens
 * Material system: soft ivory, graphite bevels, Life OS purple/green/amber state accents
 */

function TaskToken() {
  return (
    <div className="blue-token blue-token--task" aria-label="Task item">
      <div className="blue-token__check-box">
        <Check size={13} strokeWidth={2.8} />
      </div>
    </div>
  );
}

function CalendarCube() {
  return (
    <div className="blue-token blue-token--calendar" aria-label="Calendar event 10:00 AM">
      <div className="blue-token__cal-top">
        <span className="blue-token__cal-top-dot" />
        <span className="blue-token__cal-top-dot" />
      </div>
      <div className="blue-token__cal-date">10</div>
    </div>
  );
}

function HabitRing() {
  return (
    <div className="blue-token blue-token--habit" aria-label="Habit 5km run completed">
      <svg className="blue-token__ring-svg" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3.5"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3.5"
          strokeDasharray="80, 100"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Flame size={12} style={{ color: "#22c55e" }} />
      </div>
    </div>
  );
}

function NoteTile() {
  return (
    <div className="blue-token blue-token--note" aria-label="Quick note">
      <div className="blue-token__note-fold" />
      <div className="blue-token__note-lines">
        <div className="blue-token__note-line" />
        <div className="blue-token__note-line" />
        <div className="blue-token__note-line" />
      </div>
    </div>
  );
}

function BellToken() {
  return (
    <div
      className="blue-token"
      style={{ width: 36, height: 36, borderRadius: "50%", background: "#ffffff" }}
      aria-label="Notification reminder"
    >
      <Bell size={13} style={{ color: "#f59e0b" }} />
    </div>
  );
}

function ClockToken() {
  return (
    <div
      className="blue-token"
      style={{ width: 34, height: 34, borderRadius: "50%", background: "#ffffff" }}
      aria-label="Dentist appointment at 4:00"
    >
      <Clock size={13} style={{ color: "#787cf8" }} />
    </div>
  );
}

/**
 * BlueVisual: "Scattered Life → Life OS Pulls It Together → Calm Order"
 */
export function BlueVisual() {
  return (
    <div
      className="blue-gravity-stage"
      role="region"
      aria-label="How Life OS brings scattered daily tasks, calendar, habits, and focus into one calm center"
    >
      {/* ── DEDICATED MOBILE COMPOSITION (<768px): Unified Daily Overview ── */}
      <div className="blue-mobile-card" aria-label="Mobile Unified Workspace Overview">
        {/* Topbar */}
        <div className="blue-mob__topbar">
          <div className="blue-mob__brand">
            <CheckCircle2 size={13} className="blue-mob__brand-icon" strokeWidth={2.8} />
            <span className="blue-mob__brand-name">Life OS</span>
            <span className="blue-mob__date">Today · Thu 16</span>
          </div>
          <div className="blue-mob__badge">
            <span className="blue-mob__dot" aria-hidden="true" />
            <span>Aligned</span>
          </div>
        </div>

        {/* Headline */}
        <div className="blue-mob__header">
          <h4 className="blue-mob__title">Good morning</h4>
          <span className="blue-mob__capacity">
            3 priorities · <strong>2h 10m left</strong>
          </span>
        </div>

        {/* 3 Unified Pillars: Calendar, Priority Task, Daily Habits */}
        <div className="blue-mob__pillars">
          {/* Pillar 1: Calendar */}
          <div className="blue-mob__row blue-mob__row--cal">
            <div className="blue-mob__row-left">
              <span className="blue-mob__icon-box blue-mob__icon-box--cal">
                <Calendar size={13} />
              </span>
              <div className="blue-mob__row-text">
                <p className="blue-mob__row-title">Team product sync</p>
                <span className="blue-mob__row-sub">10:00 AM · Google Meet</span>
              </div>
            </div>
            <span className="blue-mob__pill blue-mob__pill--cal">Calendar</span>
          </div>

          {/* Pillar 2: Priority Task */}
          <div className="blue-mob__row blue-mob__row--task">
            <div className="blue-mob__row-left">
              <span className="blue-mob__idx">01</span>
              <div className="blue-mob__row-text">
                <p className="blue-mob__row-title">Ship auth bugfix</p>
                <span className="blue-mob__row-sub">Next queued task</span>
              </div>
            </div>
            <span className="blue-mob__pill blue-mob__pill--priority">Top priority</span>
          </div>

          {/* Pillar 3: Habit Routine */}
          <div className="blue-mob__habit-card">
            <div className="blue-mob__habit-header">
              <span className="blue-mob__habit-title">Daily Habits</span>
              <span className="blue-mob__habit-count">2 of 3 completed</span>
            </div>
            <div className="blue-mob__chips">
              <div className="blue-mob__chip blue-mob__chip--done">
                <Check size={11} strokeWidth={2.6} />
                <span>Run 5km</span>
              </div>
              <div className="blue-mob__chip blue-mob__chip--done">
                <Check size={11} strokeWidth={2.6} />
                <span>Read 30m</span>
              </div>
              <div className="blue-mob__chip blue-mob__chip--pending">
                <Flame size={11} className="blue-mob__flame-icon" />
                <span>Meditate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom AI Context Ribbon */}
        <div className="blue-mob__ai">
          <Sparkles size={12} className="blue-mob__ai-icon" />
          <p className="blue-mob__ai-text">You're on track. All daily tools in one morning flow.</p>
        </div>
      </div>
      {/* ── BACKGROUND GRAVITY CONNECTOR LINES (SVG) ── */}
      <svg
        className="blue-gravity-svg"
        viewBox="0 0 1000 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        {/* Subtle curved paths connecting orbital tokens into Life OS gravity hub */}
        <path
          d="M 120 90 C 180 90, 200 160, 260 170"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1.25"
          fill="none"
        />
        <path
          d="M 160 190 C 200 190, 220 220, 260 220"
          stroke="rgba(255, 255, 255, 0.32)"
          strokeWidth="1.25"
          fill="none"
        />
        <path
          d="M 130 300 C 180 300, 210 260, 260 260"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1.25"
          fill="none"
        />
        <path
          d="M 110 410 C 170 410, 200 320, 260 300"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.25"
          fill="none"
        />

        {/* Top-to-center gravity line */}
        <path
          d="M 280 40 C 330 40, 360 80, 380 110"
          stroke="rgba(255, 255, 255, 0.24)"
          strokeWidth="1.25"
          fill="none"
        />

        {/* Rightward flow into clarity */}
        <path
          d="M 720 250 C 760 250, 780 230, 810 230"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="1.25"
          fill="none"
        />
      </svg>

      {/* ── MAIN ASYMMETRIC WRAPPER ── */}
      <div className="blue-gravity-content">
        {/* ── LEFT: SCATTERED ORBITAL TOKENS ── */}
        <div className="blue-orbit-field">
          {/* Token 1: Task */}
          <div className="blue-token-wrap">
            <TaskToken />
            <span className="blue-token-label">Ship auth bugfix</span>
          </div>

          {/* Token 2: Calendar */}
          <div className="blue-token-wrap">
            <CalendarCube />
            <span className="blue-token-label">Team sync · 10:00</span>
          </div>

          {/* Token 3: Habit */}
          <div className="blue-token-wrap">
            <HabitRing />
            <span className="blue-token-label">Run 5km</span>
          </div>

          {/* Token 4: Quick Note */}
          <div className="blue-token-wrap">
            <NoteTile />
            <span className="blue-token-label">Idea: onboarding</span>
          </div>
        </div>

        {/* ── CENTER: DOMINANT HERO PRODUCT INTERFACE (56%) ── */}
        <div className="blue-hero-wrap">
          {/* Overlapping 3D Token at upper-left corner */}
          <div className="blue-overlap-token blue-overlap-token--top-left" aria-hidden="true">
            <BellToken />
          </div>

          {/* Overlapping 3D Token at bottom-right corner */}
          <div className="blue-overlap-token blue-overlap-token--bottom-right" aria-hidden="true">
            <ClockToken />
          </div>

          <div className="blue-hero-product">
            {/* Topbar */}
            <div className="blue-os__topbar">
              <div className="blue-os__brand-zone">
                <div className="blue-os__logo-icon" aria-hidden="true">
                  <CheckCircle2 size={10} strokeWidth={2.8} />
                </div>
                <span className="blue-os__title">Life OS</span>
              </div>

              <div className="blue-os__meta-zone">
                <span className="blue-os__date">Today · Thu 16</span>
                <div className="blue-os__status-badge">
                  <span className="blue-os__live-pulse" aria-hidden="true" />
                  <span>Aligned</span>
                </div>
              </div>
            </div>

            {/* Interior Content */}
            <div className="blue-os__content">
              {/* Greeting row */}
              <div className="blue-os__headline-row">
                <h4 className="blue-os__welcome">Good morning</h4>
                <span className="blue-os__capacity-callout">
                  3 priorities · <strong>2h 10m left</strong>
                </span>
              </div>

              {/* Split Dashboard: Priorities + Focus Engine */}
              <div className="blue-os__split">
                {/* Left: Ranked Priorities */}
                <div className="blue-os__column">
                  <span className="blue-os__col-label">Top Priorities</span>
                  <div className="blue-os__tasks">
                    <div className="blue-os__task-row blue-os__task-row--hero">
                      <div className="blue-os__task-left">
                        <span className="blue-os__task-idx">01</span>
                        <p className="blue-os__task-name">Ship auth bugfix</p>
                      </div>
                      <span className="blue-os__priority-badge">Top priority</span>
                    </div>

                    <div className="blue-os__task-row">
                      <div className="blue-os__task-left">
                        <span className="blue-os__task-idx">02</span>
                        <p className="blue-os__task-name">Review PR #142</p>
                      </div>
                    </div>

                    <div className="blue-os__task-row">
                      <div className="blue-os__task-left">
                        <span className="blue-os__task-idx">03</span>
                        <p className="blue-os__task-name">Write Q4 doc</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Active Focus Hero & Habits */}
                <div className="blue-os__column blue-os__column--right">
                  <div className="blue-os__focus-panel">
                    <div className="blue-os__focus-top">
                      <span className="blue-os__focus-title">
                        <span className="blue-os__live-pulse" aria-hidden="true" />
                        Focus Active
                      </span>
                      <span style={{ fontSize: 9.5, color: "#4ade80", fontWeight: 500 }}>Deep work</span>
                    </div>

                    {/* Dominant 26px tabular timer */}
                    <div className="blue-os__focus-timer" aria-label="Timer 42 minutes 18 seconds">
                      42:18
                    </div>
                    <p className="blue-os__focus-subject">Writing launch brief</p>
                  </div>

                  {/* Habit Progress Row */}
                  <div className="blue-os__habit-group">
                    <div className="blue-os__habit-chip blue-os__habit-chip--done">
                      <span>Run 5km</span>
                      <Check size={9} strokeWidth={2.5} />
                    </div>
                    <div className="blue-os__habit-chip blue-os__habit-chip--done">
                      <span>Read 30m</span>
                      <Check size={9} strokeWidth={2.5} />
                    </div>
                    <div className="blue-os__habit-chip">
                      <span>Meditate</span>
                      <span style={{ opacity: 0.5 }}>○</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom AI Context Ribbon */}
              <div className="blue-os__ai-strip">
                <span className="blue-os__ai-badge">AI Context</span>
                <p className="blue-os__ai-msg">You're on track. 2h 10m capacity available today.</p>
                <span className="blue-os__ai-meta">
                  <Sparkles size={11} style={{ display: "inline", verticalAlign: "middle", color: "#a5b4fc" }} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: HUMAN OUTCOMES & VISUAL PROOF (26%) ── */}
        <div className="blue-outcome-column">
          <p className="blue-outcome__eyebrow">From scattered to aligned</p>
          <h3 className="blue-outcome__hero-text">
            Less to hold
            <br />
            in your head.
          </h3>

          {/* Asymmetric Visual Proof Numbers */}
          <div className="blue-outcome__metrics">
            <div className="blue-metric-item">
              <span className="blue-metric-item__num blue-metric-item__num--accent">03</span>
              <p className="blue-metric-item__label">priorities clear</p>
            </div>

            <div className="blue-metric-item">
              <span className="blue-metric-item__num blue-metric-item__num--green">42m</span>
              <p className="blue-metric-item__label">protected focus</p>
            </div>

            <div className="blue-metric-item">
              <span className="blue-metric-item__num blue-metric-item__num--accent">02</span>
              <p className="blue-metric-item__label">habits done</p>
            </div>

            <div className="blue-metric-item">
              <span className="blue-metric-item__num blue-metric-item__num--amber">Ready</span>
              <p className="blue-metric-item__label">tomorrow planned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}