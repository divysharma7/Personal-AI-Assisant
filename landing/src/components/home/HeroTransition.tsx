import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { heroCopy, panelFeatures, matrixCells, cellLayouts } from '../landing/MistralHero/heroContent'
import './HeroTransition.css'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// ─────────────────────────────────────────────────────────────────────────────
// TUNABLE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
export const PIN_END = '+=150%'          // Scroll distance to complete scrubbed animation
export const SCRUB_VALUE = 0.5           // 0.5 for tight, steady tracking (or true for exact 1:1)
export const GRID_GAP = 12               // Initial gap between grid cells in pixels
export const BORDER_RADIUS = 16          // Initial border radius of cells in pixels
export const TIMELINE_EASE = 'none'      // Ease for master scrubbed timeline
export const TWEEN_EASE = 'none'         // Linear ease: strictly steady speed without acceleration/deceleration

// Safe isomorphic layout effect for React / SSR environments
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// ─────────────────────────────────────────────────────────────────────────────
// PRECOMPUTED MATRIX GEOMETRY (0ms render overhead)
// ─────────────────────────────────────────────────────────────────────────────
const layout = cellLayouts.full
const matrixCols = Math.max(...layout.map((l) => l.col + l.colSpan - 1))
const matrixRows = Math.max(...layout.map((l) => l.row + l.rowSpan - 1))

const PRECOMPUTED_TILES = matrixCells.map((cell) => {
  const cellLayout = layout.find((l) => l.id === cell.id)
  if (!cellLayout) return null
  return {
    id: cell.id,
    tone: cell.tone,
    style: {
      left: `${((cellLayout.col - 1) / matrixCols) * 100}%`,
      top: `${((cellLayout.row - 1) / matrixRows) * 100}%`,
      width: `${(cellLayout.colSpan / matrixCols) * 100}%`,
      height: `${(cellLayout.rowSpan / matrixRows) * 100}%`,
    },
  }
}).filter((item): item is NonNullable<typeof item> => item !== null)

export default function HeroTransition() {
  // Single root reference: all element targeting is handled via scoped selector
  const sectionRef = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Scoped selector: replaces individual useRefs cleanly & safely
    const q = gsap.utils.selector(section)
    const grid = q('.expand-grid')[0] as HTMLElement | undefined
    if (!grid) return

    // Dynamically measure announcement banner and sticky navbar
    const updateHeaderDimensions = () => {
      const banner = document.querySelector('[role="region"][aria-label="Announcement"]') as HTMLElement | null
      const nav = document.querySelector('header') as HTMLElement | null
      const bannerH = banner ? banner.offsetHeight : 0
      const navH = nav ? nav.offsetHeight : 64
      const totalH = bannerH + navH

      section.style.setProperty('--banner-height', `${bannerH}px`)
      section.style.setProperty('--nav-height', `${navH}px`)
      section.style.setProperty('--total-header-height', `${totalH}px`)
      return { bannerH, navH, totalH }
    }

    updateHeaderDimensions()

    const mm = gsap.matchMedia()

    // ─────────────────────────────────────────────────────────────────────────
    // DESKTOP: PINNED SCROLL-DRIVEN UNIFORM GRID EXPAND ANIMATION
    // ─────────────────────────────────────────────────────────────────────────
    mm.add(
      '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
      () => {
        updateHeaderDimensions()

        // Initial 3:1 column ratio (75% / 25%) and 1:2 row ratio (33.333% / 66.667%)
        grid.style.setProperty('--col-a', '75%')
        grid.style.setProperty('--col-b', '25%')
        grid.style.setProperty('--row-a', '33.333%')
        grid.style.setProperty('--row-b', '66.667%')
        grid.style.setProperty('--grid-gap', `${GRID_GAP}px`)

        gsap.set(q('.grid-cell--b'), { borderRadius: `${BORDER_RADIUS}px` })
        gsap.set(q('.cell-push-wrapper--a, .cell-push-wrapper--c, .cell-push-wrapper--d'), {
          xPercent: 0,
          yPercent: 0,
          force3D: true,
        })

        // Normalized progress tracker (0 = start, 1 = fully expanded)
        const progressObj = { p: 0 }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            // Pins right below the sticky navbar once the announcement banner scrolls away
            start: () => `top ${document.querySelector('header')?.offsetHeight || 64}px`,
            end: PIN_END,
            pin: true,
            pinSpacing: true,
            scrub: SCRUB_VALUE,
            anticipatePin: 1,
            fastScrollEnd: true,
            preventOverlaps: true,
            invalidateOnRefresh: true,
          },
          defaults: { ease: TIMELINE_EASE },
        })

        // 1. Uniform proportional track expansion on both axes:
        // Col B width goes 25% -> 100% at the exact same proportional rate as Row A height goes 33.333% -> 100%
        tl.to(
          progressObj,
          {
            p: 1,
            duration: 1,
            ease: TWEEN_EASE,
            onUpdate: () => {
              const p = progressObj.p
              const widthB = 25 + 75 * p
              const widthA = 100 - widthB
              const heightA = 33.333 + 66.667 * p
              const heightB = 100 - heightA
              const gap = GRID_GAP * (1 - p)

              grid.style.setProperty('--col-a', `${widthA}%`)
              grid.style.setProperty('--col-b', `${widthB}%`)
              grid.style.setProperty('--row-a', `${heightA}%`)
              grid.style.setProperty('--row-b', `${heightB}%`)
              grid.style.setProperty('--grid-gap', `${gap}px`)
            },
          },
          0
        )

        // 2. Component 1 (Cell A) moves UP out of the grid
        tl.to(
          q('.cell-push-wrapper--a'),
          {
            yPercent: -100,
            duration: 1,
            ease: TWEEN_EASE,
            force3D: true,
          },
          0
        )

        // 3. Component 3 (Cell C) moves LEFT out of the grid
        tl.to(
          q('.cell-push-wrapper--c'),
          {
            xPercent: -100,
            duration: 1,
            ease: TWEEN_EASE,
            force3D: true,
          },
          0
        )

        // 4. Component 4 (Cell D) moves DOWN out of the grid
        tl.to(
          q('.cell-push-wrapper--d'),
          {
            yPercent: 100,
            duration: 1,
            ease: TWEEN_EASE,
            force3D: true,
          },
          0
        )

        // 5. Cell B border-radius flattens from 16px to 0px
        tl.to(
          q('.grid-cell--b'),
          {
            borderRadius: '0px',
            duration: 1,
            ease: TWEEN_EASE,
          },
          0
        )
      },
      section
    )

    // ─────────────────────────────────────────────────────────────────────────
    // MOBILE (< 768px): Single-column stack, no pin, scroll trigger per cell
    // ─────────────────────────────────────────────────────────────────────────
    mm.add('(max-width: 767px)', () => {
      const cells = q('.grid-cell')
      cells.forEach((cell) => {
        gsap.from(cell, {
          scrollTrigger: {
            trigger: cell,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: 'power2.out',
        })
      })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // ACCESSIBILITY: prefers-reduced-motion (Show final expanded state directly)
    // ─────────────────────────────────────────────────────────────────────────
    mm.add('(prefers-reduced-motion: reduce)', () => {
      grid.style.setProperty('--col-a', '0%')
      grid.style.setProperty('--col-b', '100%')
      grid.style.setProperty('--row-a', '100%')
      grid.style.setProperty('--row-b', '0%')
      grid.style.setProperty('--grid-gap', '0px')
      gsap.set(q('.grid-cell--b'), { borderRadius: '0px' })
      gsap.set(q('.cell-push-wrapper--a'), { yPercent: -100 })
      gsap.set(q('.cell-push-wrapper--c'), { xPercent: -100 })
      gsap.set(q('.cell-push-wrapper--d'), { yPercent: 100 })
    })

    // Refresh ScrollTrigger when DOM is fully settled
    const handleLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', handleLoad)
    if (document.readyState === 'complete') {
      ScrollTrigger.refresh()
    }

    return () => {
      window.removeEventListener('load', handleLoad)
      mm.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="grid-expand-section"
      aria-label="Introduction and mission"
    >
      <div className="grid-expand-container">
        <div className="expand-grid">
          {/* ── CELL A: Row 1, Col 1 (1st component - moves UP out of frame) ── */}
          <div className="grid-cell grid-cell--a">
            <div className="cell-push-wrapper cell-push-wrapper--a">
              <p className="orig-eyebrow">{heroCopy.headline.eyebrow}</p>
              <h1 className="orig-title">{heroCopy.headline.title}</h1>
              <p className="orig-subtitle">{heroCopy.headline.subtitle}</p>
            </div>
          </div>

          {/* ── CELL B: Row 1, Col 2 (2nd component - TARGET EXPANDING CELL) ── */}
          <div className="grid-cell grid-cell--b">
            <div className="cell-b-content">
              <div className="panel-lead">
                <p className="panel-lead-eyebrow">{heroCopy.panel.eyebrow}</p>
                <h2 className="panel-lead-mission">{heroCopy.panel.mission}</h2>
              </div>
              <ul className="panel-features-list">
                {panelFeatures.map((feature) => (
                  <li className="panel-feature-item" key={feature.title}>
                    <span className="panel-feature-symbol" aria-hidden="true">
                      {feature.symbol}
                    </span>
                    <div>
                      <h4 className="panel-feature-title">{feature.title}</h4>
                      <p className="panel-feature-detail">{feature.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── CELL C: Row 2, Col 1 (3rd component - moves LEFT out of frame) ── */}
          <div className="grid-cell grid-cell--c">
            <div className="cell-push-wrapper cell-push-wrapper--c">
              <div className="productMatrixWrapper">
                {PRECOMPUTED_TILES.map((tile) => (
                  <div
                    key={tile.id}
                    className={`matrixCell matrixCell--${tile.tone}`}
                    style={tile.style}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── CELL D: Row 2, Col 2 (4th component - moves DOWN out of frame) ── */}
          <div className="grid-cell grid-cell--d">
            <div className="cell-push-wrapper cell-push-wrapper--d">
              <h2 className="statementText">{heroCopy.statement}</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
