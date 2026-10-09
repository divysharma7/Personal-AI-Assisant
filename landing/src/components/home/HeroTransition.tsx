import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import './HeroTransition.css'

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const phase = (p: number, start: number, end: number) =>
  clamp((p - start) / (end - start))
const ease = (p: number) => p * p * (3 - 2 * p)

/**
 * Mistral-style sticky scroll hero for Life OS.
 *
 * Architecture:
 * - A 200vh scroll container holds a 100svh sticky scene.
 * - The scene is a CSS grid: 3fr (72%) / 1fr (28%), two rows.
 * - Left column: opening group (headline + decorative tiles).
 * - Right column upper: mission statement (accent panel).
 * - Right column lower: metadata (dark — returns to page background).
 *
 * Scroll mechanics:
 * - One requestAnimationFrame per scroll event computes clamped progress.
 * - CSS custom properties (--grow, --exit, --mission-scale, --icon-N)
 *   are written to the scene element; all transforms are pure CSS.
 * - Phase 0.00–0.06: static opening state
 * - Phase 0.06–0.34: opening exit (headline + tiles fade out)
 * - Phase 0.30–0.40: transition hold (controlled overlap)
 * - Phase 0.36–0.62: mission text establishes
 * - Phase 0.54–0.88: principles stagger in
 * - Phase 0.82–1.00: final settle
 */
export default function HeroTransition() {
  const sectionRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const scene = sceneRef.current
    if (!section || !scene) return

    const desktop = window.matchMedia('(min-width: 1024px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches || !desktop.matches) return

    let frame = 0
    let offset = parseFloat(getComputedStyle(scene).top) || 0
    let sceneHeight = scene.getBoundingClientRect().height
    let travel = Math.max(1, section.offsetHeight - sceneHeight)

    const update = () => {
      frame = 0

      const sectionTop = section.getBoundingClientRect().top
      const p = clamp((offset - sectionTop) / travel)

      // Opening exit: headline + tiles fade out early
      const exit = ease(phase(p, 0.06, 0.34))
      // Mission establish: accent panel claims space (small overlap with exit tail)
      const missionEstablish = ease(phase(p, 0.36, 0.62))
      // Grow: mission text expands to center, drives accent background
      const grow = ease(phase(p, 0.36, 0.80))

      scene.style.setProperty('--exit', String(exit))
      scene.style.setProperty('--grow', String(grow))
      scene.style.setProperty('--mission-scale', String(0.36 + missionEstablish * 0.64))

      // Principles stagger: 0.075 separation
      const stagger = 0.075
      for (let i = 0; i < 3; i++) {
        scene.style.setProperty(
          `--icon-${i}`,
          String(ease(phase(p, 0.56 + i * stagger, 0.86 + i * 0.02))),
        )
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const resize = () => {
      offset = parseFloat(getComputedStyle(scene).top) || 0
      sceneHeight = scene.getBoundingClientRect().height
      travel = Math.max(1, section.offsetHeight - sceneHeight)
      schedule()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(section)
    observer.observe(scene)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', resize)
    desktop.addEventListener('change', resize)
    reduced.addEventListener('change', resize)

    update()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', resize)
      desktop.removeEventListener('change', resize)
      reduced.removeEventListener('change', resize)
    }
  }, [])

  return (
    <section className="ht" ref={sectionRef} aria-label="Introduction and mission">
      <div className="ht__scene" ref={sceneRef}>
        {/* LEFT COLUMN: opening group */}
        <div className="ht__opening">
          <div className="ht__primary">
            <p className="ht__eyebrow">THE OPERATING SYSTEM FOR YOUR DAY</p>
            <h1 className="ht__title">Powerful ideas.<br />In your hands.</h1>
            <p className="ht__intro">
              One calm interface for tasks, habits, calendar, focus sessions,
              workflows, and AI.
            </p>
          </div>

          {/* Decorative tiles (bottom-left) */}
          <div className="ht__tiles" aria-hidden="true">
            <div className="ht__tile ht__tile--blocks">
              <div className="ht__blocks">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
            </div>
            <div className="ht__tile ht__tile--orbit">
              <div className="ht__orbit">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>

        {/* Expanding accent background behind mission panel */}
        <div className="ht__mission-background" aria-hidden="true" />

        {/* RIGHT UPPER: mission statement (accent panel) */}
        <div className="ht__mission">
          <p className="ht__eyebrow">OUR MISSION</p>
          <h2 className="ht__statement">
            We help people run their entire day from one calm interface.
          </h2>
          <ul className="ht__principles">
            {[
              { symbol: '✳', title: 'Tasks & Habits', detail: 'Everything in one view.' },
              { symbol: '◈', title: 'Focus Sessions', detail: 'Deep work that counts.' },
              { symbol: '↗', title: 'AI Assistant', detail: 'Knows your whole day.' },
            ].map((item, i) => (
              <li
                key={item.title}
                className={`ht__principle ht__principle--${i}`}
              >
                <span className="ht__symbol" aria-hidden="true">
                  {item.symbol}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT LOWER: dark metadata (returns to page background) */}
        <div className="ht__meta">
          <div className="ht__arrows">
            <div className="hero-arrow">
              <ArrowRight size={14} />
              <span>Press <kbd>G</kbd> for global search</span>
            </div>
            <div className="hero-arrow">
              <ArrowRight size={14} />
              <span>Scroll for next principle</span>
            </div>
          </div>
        </div>

        {/* Centered final statement (fades in as scene scrolls out) */}
        <div className="ht__centered" aria-hidden="true">
          <p className="ht__centered__text">
            We help people run their entire day from one calm interface.
          </p>
          <p className="ht__centered__subcopy">
            One calm interface for tasks, habits, calendar, focus sessions,
            workflows, and AI.
          </p>
        </div>
      </div>
    </section>
  )
}
