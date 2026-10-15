import { Link as LinkIcon, FileText } from "lucide-react";
import "./gold-visual.css";

/**
 * 3D Sculpted Glyphs: Handcrafted inline SVG dimensional icons.
 * Contained depth strictly inside the soft ivory tile.
 */

function PomodoroIcon() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="pomoBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id="pomoStem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id="pomoDial" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="100%" stopColor="#fef3c7" />
        </radialGradient>
      </defs>

      {/* Top winder & knob */}
      <rect x="17.25" y="3.5" width="3.5" height="3" rx="1" fill="url(#pomoStem)" />
      <path d="M 14 5 C 14 2.5 24 2.5 24 5" stroke="url(#pomoStem)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Small angled clock feet */}
      <path d="M 10 32 L 8 35" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      <path d="M 28 32 L 30 35" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

      {/* Main clock body */}
      <circle cx="19" cy="20.5" r="14" fill="url(#pomoBody)" />
      <circle cx="19" cy="20.5" r="13.25" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.75" fill="none" />

      {/* Inner dial */}
      <circle cx="19" cy="20.5" r="9.75" fill="url(#pomoDial)" />
      <circle cx="19" cy="20.5" r="9.75" stroke="rgba(180, 83, 9, 0.25)" strokeWidth="0.5" fill="none" />

      {/* Clock hands */}
      <line x1="19" y1="20.5" x2="15" y2="17.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19" y1="20.5" x2="22.5" y2="16.5" stroke="#1e293b" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="19" cy="20.5" r="1.2" fill="#b45309" />

      {/* Glossy top-edge reflection */}
      <path d="M 11 15 C 13.5 10 24.5 10 27 15" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function StopwatchIcon() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="swBezel" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </radialGradient>
        <radialGradient id="swDial" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </radialGradient>
      </defs>

      {/* Top loop ring */}
      <path d="M 14.5 4.5 C 14.5 2 23.5 2 23.5 4.5" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Top pusher button */}
      <rect x="17" y="3.5" width="4" height="3" rx="0.8" fill="#334155" />
      {/* Angled side pusher */}
      <path d="M 27 10 L 29 8" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

      {/* Main bezel body */}
      <circle cx="19" cy="20.5" r="14" fill="url(#swBezel)" />
      <circle cx="19" cy="20.5" r="13.25" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.75" fill="none" />

      {/* Inner dial */}
      <circle cx="19" cy="20.5" r="9.75" fill="url(#swDial)" />

      {/* Dial ticks */}
      <line x1="19" y1="12" x2="19" y2="13.5" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      <line x1="27.5" y1="20.5" x2="26" y2="20.5" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      <line x1="19" y1="29" x2="19" y2="27.5" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      <line x1="10.5" y1="20.5" x2="12" y2="20.5" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />

      {/* Needle pointing to ~12:12 */}
      <line x1="19" y1="20.5" x2="21.5" y2="14" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="19" cy="20.5" r="1.5" fill="#f59e0b" />
    </svg>
  );
}

function ManualIcon() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="barDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="barBronze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#291203" />
        </linearGradient>
        <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      <ellipse cx="19" cy="32" rx="14" ry="2" fill="rgba(0, 0, 0, 0.08)" />

      {/* Short Bar (Left) */}
      <rect x="8.5" y="21" width="5.5" height="10" rx="2.75" fill="url(#barDark)" />
      <ellipse cx="11.25" cy="22.5" rx="2.2" ry="1.2" fill="rgba(255, 255, 255, 0.35)" />

      {/* Medium Bar (Center) */}
      <rect x="16.25" y="14" width="5.5" height="17" rx="2.75" fill="url(#barBronze)" />
      <ellipse cx="19" cy="15.5" rx="2.2" ry="1.2" fill="rgba(255, 255, 255, 0.3)" />

      {/* Tall Bar (Right) */}
      <rect x="24" y="7" width="5.5" height="24" rx="2.75" fill="url(#barGold)" />
      <ellipse cx="26.75" cy="8.5" rx="2.2" ry="1.2" fill="rgba(255, 255, 255, 0.65)" />
    </svg>
  );
}

function HighPerformanceIcon() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="boltFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="boltBevel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* Drop shadow facet */}
      <path
        d="M 21.5 6.5 L 12.5 19 L 18 19 L 14.5 31.5 L 25.5 17.5 L 20 17.5 Z"
        fill="rgba(0, 0, 0, 0.12)"
        transform="translate(1, 1.5)"
      />

      {/* 3D bevel edge */}
      <path
        d="M 22 6 L 13 18.5 L 18.5 18.5 L 15 31 L 26 17 L 20.5 17 Z"
        fill="url(#boltBevel)"
      />

      {/* Main front face */}
      <path
        d="M 21 5 L 12 17.5 L 17.5 17.5 L 14 30 L 25 16 L 19.5 16 Z"
        fill="url(#boltFront)"
      />

      {/* Center highlight edge */}
      <path
        d="M 20.5 6 L 12.8 17 L 17.5 17 L 14.8 28"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function MeasurableIcon() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="mSlate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Left short bar */}
      <rect x="8.5" y="20" width="5.5" height="11" rx="2.75" fill="url(#mDark)" />
      <ellipse cx="11.25" cy="21.5" rx="2.2" ry="1.2" fill="rgba(255, 255, 255, 0.3)" />

      {/* Middle medium bar */}
      <rect x="16.25" y="13" width="5.5" height="18" rx="2.75" fill="url(#mSlate)" />
      <ellipse cx="19" cy="14.5" rx="2.2" ry="1.2" fill="rgba(255, 255, 255, 0.25)" />

      {/* Right tall bar */}
      <rect x="24" y="6" width="5.5" height="25" rx="2.75" fill="url(#mGold)" />
      <ellipse cx="26.75" cy="7.5" rx="2.2" ry="1.2" fill="rgba(255, 255, 255, 0.65)" />
    </svg>
  );
}

function IntegratedIcon() {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="chainDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="chainGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Dark Link */}
      <rect
        x="7"
        y="15"
        width="16"
        height="9"
        rx="4.5"
        transform="rotate(-45 15 19.5)"
        stroke="url(#chainDark)"
        strokeWidth="3.2"
        fill="none"
      />

      {/* Gold Link */}
      <rect
        x="15"
        y="14"
        width="16"
        height="9"
        rx="4.5"
        transform="rotate(-45 23 18.5)"
        stroke="url(#chainGold)"
        strokeWidth="3.2"
        fill="none"
      />

      {/* Overlap shadow & weave highlight */}
      <path
        d="M 18.5 13 L 21 15.5"
        stroke="rgba(0, 0, 0, 0.25)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 17 19 L 20 22"
        stroke="rgba(255, 255, 255, 0.55)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * GoldVisual: Focus Engine visual machine matching the reference screenshot.
 * Aligned 5-track grid: Left (240px) | Connector (56px) | Center (390px) | Connector (48px) | Right (250px)
 */
export function GoldVisual() {
  return (
    <div
      className="focus-machine"
      role="region"
      aria-label="Focus engine system diagram: Ways to start, central focus engine, and outcomes"
    >
      {/* ── ROW 1: HEADERS ── */}

      {/* Left Header */}
      <div className="focus-machine__header focus-machine__header--left">
        <p className="focus-machine__eyebrow">Ways to start</p>
        <h3 className="focus-machine__title">
          Bring your
          <br />
          own style
        </h3>
        <p className="focus-machine__sub">
          Start a focus session in a way that fits your flow.
        </p>
      </div>

      {/* Center Header */}
      <div className="focus-machine__header focus-machine__header--center">
        <p className="focus-machine__eyebrow">Life OS works</p>
        <h3 className="focus-machine__title">Focus engine</h3>
        <p className="focus-machine__sub">
          Task-linked sessions with
          <br />
          real-time tracking.
        </p>
      </div>

      {/* Right Header */}
      <div className="focus-machine__header focus-machine__header--right">
        <p className="focus-machine__eyebrow">You get</p>
        <h3 className="focus-machine__title">
          More than
          <br />
          a timer
        </h3>
        <p className="focus-machine__sub">
          Focus that shows up in your work, your history and your habits.
        </p>
      </div>

      {/* ── ROW 2: BODIES & CONNECTORS ── */}

      {/* Left Rows */}
      <div className="focus-machine__body--left">
        {/* Row 1: Pomodoro */}
        <div className="focus-row">
          <div className="feature-icon">
            <div className="feature-icon__glyph">
              <PomodoroIcon />
            </div>
          </div>
          <div className="focus-row__content">
            <h4 className="focus-row__title">Pomodoro</h4>
            <p className="focus-row__desc">25 min focus blocks</p>
          </div>
        </div>

        {/* Row 2: Stopwatch */}
        <div className="focus-row">
          <div className="feature-icon">
            <div className="feature-icon__glyph">
              <StopwatchIcon />
            </div>
          </div>
          <div className="focus-row__content">
            <h4 className="focus-row__title">Stopwatch</h4>
            <p className="focus-row__desc">Open-ended sessions</p>
          </div>
        </div>

        {/* Row 3: Manual */}
        <div className="focus-row">
          <div className="feature-icon">
            <div className="feature-icon__glyph">
              <ManualIcon />
            </div>
          </div>
          <div className="focus-row__content">
            <h4 className="focus-row__title">Manual</h4>
            <p className="focus-row__desc">Log time anytime</p>
          </div>
        </div>
      </div>

      {/* Left Connector (Desktop): Integrated SVG with starting dots and 3 smooth converging lines */}
      <div className="focus-machine__connector-left" aria-hidden="true">
        <svg viewBox="0 0 56 232" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Row 1 Node & Path (Center Y = 30) */}
          <circle cx="5" cy="30" r="3.5" fill="#fdfbf7" stroke="#6b5020" strokeWidth="1.5" />
          <path
            d="M 8.5 30 H 22 Q 34 30 34 44 V 102 Q 34 116 44 116 H 50"
            stroke="#6b5020"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Row 2 Node & Path (Center Y = 116) */}
          <circle cx="5" cy="116" r="3.5" fill="#fdfbf7" stroke="#6b5020" strokeWidth="1.5" />
          <path
            d="M 8.5 116 H 50"
            stroke="#6b5020"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Row 3 Node & Path (Center Y = 202) */}
          <circle cx="5" cy="202" r="3.5" fill="#fdfbf7" stroke="#6b5020" strokeWidth="1.5" />
          <path
            d="M 8.5 202 H 22 Q 34 202 34 188 V 130 Q 34 116 44 116 H 50"
            stroke="#6b5020"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Arrowhead pointing to the Focus Engine card */}
          <polygon points="46,112 52,116 46,120" fill="#6b5020" />
        </svg>
      </div>

      {/* Mobile Vertical Connector 1 (↓) */}
      <div className="focus-machine__connector-mobile" aria-hidden="true">
        <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
          <line x1="12" y1="4" x2="12" y2="32" stroke="#6b5020" strokeWidth="1.5" />
          <polygon points="8,29 12,36 16,29" fill="#6b5020" />
        </svg>
      </div>

      {/* Center Card */}
      <div className="focus-machine__body--center">
        <div className="focus-engine-card">
          {/* Top status & task pill */}
          <div className="focus-engine-card__header">
            <div className="focus-engine-card__status">
              <span className="focus-engine-card__pulse-dot" aria-hidden="true" />
              <span>Focus active</span>
            </div>

            <div className="focus-engine-card__pill">
              <LinkIcon size={12} strokeWidth={2} aria-hidden="true" />
              <span>Task linked</span>
            </div>
          </div>

          {/* Circular Progress Gauge */}
          <div className="focus-engine-card__gauge-wrap">
            <svg
              className="focus-engine-card__gauge"
              viewBox="0 0 148 148"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="gaugeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>

              {/* Background Track Circle */}
              <circle
                cx="74"
                cy="74"
                r="58"
                stroke="#faecd0"
                strokeWidth="10"
                fill="none"
              />

              {/* Progress Arc (~70% completed) */}
              <circle
                cx="74"
                cy="74"
                r="58"
                stroke="url(#gaugeGold)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="364.42"
                strokeDashoffset="105"
              />
            </svg>

            <div className="focus-engine-card__gauge-text">
              <span
                className="focus-engine-card__timer"
                aria-label="Current timer 24 minutes 18 seconds"
              >
                24:18
              </span>
              <span className="focus-engine-card__label">Deep focus</span>
            </div>
          </div>

          <div className="focus-engine-card__divider" aria-hidden="true" />

          {/* Bottom active task row */}
          <div className="focus-engine-card__footer">
            <div className="focus-engine-card__task">
              <FileText size={16} className="focus-engine-card__task-icon" aria-hidden="true" />
              <div className="focus-engine-card__task-text">
                <span className="focus-engine-card__task-prefix">Working on</span>
                <span className="focus-engine-card__task-name">Ship auth bugfix</span>
              </div>
            </div>

            <button
              type="button"
              className="focus-engine-card__btn"
              aria-label="Open current focus session details"
            >
              <span>Open session</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Connector (Desktop): Single clean horizontal line at Y = 116 */}
      <div className="focus-machine__connector-right" aria-hidden="true">
        <svg viewBox="0 0 48 232" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 0 116 H 40"
            stroke="#6b5020"
            strokeWidth="1.5"
            fill="none"
          />
          <polygon points="36,112 42,116 36,120" fill="#6b5020" />
        </svg>
      </div>

      {/* Mobile Vertical Connector 2 (↓) */}
      <div className="focus-machine__connector-mobile" aria-hidden="true">
        <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
          <line x1="12" y1="4" x2="12" y2="32" stroke="#6b5020" strokeWidth="1.5" />
          <polygon points="8,29 12,36 16,29" fill="#6b5020" />
        </svg>
      </div>

      {/* Right Rows */}
      <div className="focus-machine__body--right">
        {/* Row 1: High performance */}
        <div className="focus-row">
          <div className="feature-icon">
            <div className="feature-icon__glyph">
              <HighPerformanceIcon />
            </div>
          </div>
          <div className="focus-row__content">
            <h4 className="focus-row__title">High performance</h4>
            <p className="focus-row__desc">60fps compositor</p>
          </div>
        </div>

        {/* Row 2: Measurable */}
        <div className="focus-row">
          <div className="feature-icon">
            <div className="feature-icon__glyph">
              <MeasurableIcon />
            </div>
          </div>
          <div className="focus-row__content">
            <h4 className="focus-row__title">Measurable</h4>
            <p className="focus-row__desc">Session history and insights</p>
          </div>
        </div>

        {/* Row 3: Integrated */}
        <div className="focus-row">
          <div className="feature-icon">
            <div className="feature-icon__glyph">
              <IntegratedIcon />
            </div>
          </div>
          <div className="focus-row__content">
            <h4 className="focus-row__title">Integrated</h4>
            <p className="focus-row__desc">Connected to your tasks and habits</p>
          </div>
        </div>
      </div>
    </div>
  );
}