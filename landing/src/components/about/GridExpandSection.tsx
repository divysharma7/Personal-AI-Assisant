import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles } from "lucide-react";
import "./grid-expand.css";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Safe isomorphic layout effect for SSR and client execution
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TWEAKABLE CONFIGURATION CONSTANTS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const GRID_CONFIG = {
  /** Distance to pin the section while scrubbing (e.g. "+=150%", "+=200%") */
  pinDistance: "+=150%",

  /** Scrub catch-up delay: 1 for buttery smooth, 0.5 for tighter responsive feel */
  scrub: 1,

  /** Anticipates pinning by 1 tick to prevent slight visual scroll jumps */
  anticipatePin: 1,

  /** Initial gap between grid cells */
  initialGap: "12px",

  /** Initial border radius on cells */
  initialRadius: "16px",

  /** Master timeline easing (use "none" so scroll position maps linearly to progress) */
  timelineEase: "none",

  /** Easing applied to the grid track collapse */
  gridEase: "power2.inOut",

  /** Scale multiplier of Cell B's inner background media */
  mediaScale: 1.1,

  /** Timeline progress mark (0 to 1) when cells A, C, D complete their fade & shrink */
  fadeThreshold: 0.6,

  /** Timeline progress mark (0 to 1) when Cell B headline starts sliding/fading in */
  overlayStart: 0.7,
} as const;

/**
 * Cell Content Interface
 * Swap your own images, videos, tags, and copy through these props or directly in JSX.
 */
export interface GridExpandContent {
  cellA?: {
    tag?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  cellB?: {
    tag?: string;
    title?: string;
    eyebrow?: string;
    expandedTitle?: string;
    expandedSubtitle?: string;
    ctaText?: string;
    ctaHref?: string;
    mediaUrl?: string;
    isVideo?: boolean;
  };
  cellC?: {
    tag?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  cellD?: {
    tag?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

const defaultContent: GridExpandContent = {
  cellA: {
    tag: "01 · Principles",
    title: "Intelligence meets calm.",
    description: "Technology designed around human limits, not infinite feeds.",
  },
  cellB: {
    tag: "02 · The Vision",
    eyebrow: "Our Core Mission",
    expandedTitle: "One operating system\nfor your entire day.",
    expandedSubtitle:
      "We believe technology should clarify your focus, protect your attention, and carry unfinished work forward with zero stress.",
    ctaText: "Explore the philosophy",
    ctaHref: "#explore",
  },
  cellC: {
    tag: "03 · Craft & Architecture",
    title: "Everything connects. Everything flows.",
    description:
      "Tasks, calendar, habits, and focus sessions orchestrated into a single repeatable daily rhythm.",
  },
  cellD: {
    tag: "04 · Alignment",
    title: "Calm by design.",
    description: "Less to hold in your head. More capacity for what matters.",
  },
};

interface GridExpandSectionProps {
  content?: GridExpandContent;
}

export function GridExpandSection({ content = defaultContent }: GridExpandSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellARef = useRef<HTMLDivElement>(null);
  const cellBRef = useRef<HTMLDivElement>(null);
  const cellCRef = useRef<HTMLDivElement>(null);
  const cellDRef = useRef<HTMLDivElement>(null);
  const mediaBRef = useRef<HTMLDivElement>(null);
  const overlayBRef = useRef<HTMLDivElement>(null);

  // GSAP animation setup with matchMedia and cleanup
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── 1. DESKTOP & NON-REDUCED MOTION: Full scrubbed pinned timeline ──
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (
            !sectionRef.current ||
            !gridRef.current ||
            !cellARef.current ||
            !cellBRef.current ||
            !cellCRef.current ||
            !cellDRef.current ||
            !mediaBRef.current ||
            !overlayBRef.current
          ) {
            return;
          }

          // Initial state setup
          gsap.set(gridRef.current, {
            gridTemplateColumns: "3fr 1fr",
            gridTemplateRows: "1fr 2fr",
            gap: GRID_CONFIG.initialGap,
          });

          gsap.set([cellARef.current, cellCRef.current, cellDRef.current], {
            opacity: 1,
            scale: 1,
          });

          gsap.set(cellBRef.current, {
            borderRadius: GRID_CONFIG.initialRadius,
          });

          gsap.set(mediaBRef.current, {
            scale: 1,
          });

          gsap.set(overlayBRef.current, {
            opacity: 0,
            y: 40,
          });

          // Master Scrubbed Timeline
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: GRID_CONFIG.pinDistance,
              pin: true,
              pinSpacing: true,
              scrub: GRID_CONFIG.scrub,
              anticipatePin: GRID_CONFIG.anticipatePin,
              invalidateOnRefresh: true,
            },
            defaults: {
              ease: GRID_CONFIG.timelineEase,
            },
          });

          // 1 & 2 & 3: Collapse grid columns (3fr 1fr -> 0fr 1fr), rows (1fr 2fr -> 1fr 0fr), gap (12px -> 0px)
          tl.to(
            gridRef.current,
            {
              gridTemplateColumns: "0fr 1fr",
              gridTemplateRows: "1fr 0fr",
              gap: "0px",
              duration: 1,
              ease: GRID_CONFIG.gridEase,
            },
            0
          );

          // 4: Cells A, C, D fade out and shrink slightly during the first 60% of scroll
          tl.to(
            [cellARef.current, cellCRef.current, cellDRef.current],
            {
              opacity: 0,
              scale: 0.92,
              duration: GRID_CONFIG.fadeThreshold,
              ease: "power1.out",
              stagger: 0.03,
            },
            0
          );

          // 5: Cell B corner radius expands to edge (16px -> 0px) and inner media zooms (1 -> 1.1)
          tl.to(
            cellBRef.current,
            {
              borderRadius: "0px",
              duration: 0.85,
              ease: GRID_CONFIG.gridEase,
            },
            0
          );

          tl.to(
            mediaBRef.current,
            {
              scale: GRID_CONFIG.mediaScale,
              duration: 1,
              ease: "none",
            },
            0
          );

          // 6: Text overlay inside Cell B fades and slides up in the final ~30%
          tl.fromTo(
            overlayBRef.current,
            {
              opacity: 0,
              y: 40,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1 - GRID_CONFIG.overlayStart,
              ease: "power2.out",
            },
            GRID_CONFIG.overlayStart
          );

          return () => {
            tl.kill();
          };
        }
      );

      // ── 2. MOBILE (< 768px): Responsive single-column stack without pin ──
      mm.add("(max-width: 767px)", () => {
        // Simple entrance animation for cells on mobile
        gsap.from(".grid-expand__cell", {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
        });
      });

      // ── 3. REDUCED MOTION: Static expanded state with no scrubbing ──
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (!gridRef.current || !cellBRef.current || !overlayBRef.current) return;

        gsap.set(gridRef.current, {
          gridTemplateColumns: "0fr 1fr",
          gridTemplateRows: "1fr 0fr",
          gap: "0px",
        });

        gsap.set([cellARef.current, cellCRef.current, cellDRef.current], {
          opacity: 0,
          display: "none",
        });

        gsap.set(cellBRef.current, {
          borderRadius: "0px",
        });

        gsap.set(overlayBRef.current, {
          opacity: 1,
          y: 0,
        });
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  // Refresh ScrollTrigger when images/fonts finish loading
  useEffect(() => {
    const onAssetsReady = () => ScrollTrigger.refresh();
    window.addEventListener("load", onAssetsReady);

    if (document.fonts?.ready) {
      document.fonts.ready.then(onAssetsReady).catch(() => {});
    }

    return () => window.removeEventListener("load", onAssetsReady);
  }, []);

  return (
    <div ref={wrapperRef} className="grid-expand-wrapper">
      <section
        ref={sectionRef}
        className="grid-expand-section"
        aria-label="Interactive philosophy grid"
      >
        <div ref={gridRef} className="grid-expand">
          {/* ── CELL A: Row 1, Col 1 (Wide, short) ── */}
          <div
            ref={cellARef}
            className="grid-expand__cell grid-expand__cell--a"
            aria-label={content.cellA?.title}
          >
            <div className="grid-expand__bg-mesh grid-expand__bg-mesh--a" />
            <div className="grid-expand__content">
              {content.cellA?.tag && (
                <span className="grid-expand__tag">{content.cellA.tag}</span>
              )}
              <div>
                <h3 className="grid-expand__title">{content.cellA?.title}</h3>
                <p className="grid-expand__desc">{content.cellA?.description}</p>
              </div>
            </div>
          </div>

          {/* ── CELL B: Row 1, Col 2 (TARGET cell that expands to full viewport) ── */}
          <div
            ref={cellBRef}
            className="grid-expand__cell grid-expand__cell--b"
            aria-label="Expanding focus showcase"
          >
            {/* Inner background media that subtly scales up */}
            <div ref={mediaBRef} className="grid-expand__media-box">
              <div className="grid-expand__bg-mesh grid-expand__bg-mesh--b" />
            </div>

            {/* Initial collapsed label inside Cell B */}
            <div className="grid-expand__content">
              {content.cellB?.tag && (
                <span className="grid-expand__tag">{content.cellB.tag}</span>
              )}
            </div>

            {/* Full-bleed headline overlay that fades and slides up in final 30% of scroll */}
            <div ref={overlayBRef} className="grid-expand__overlay">
              {content.cellB?.eyebrow && (
                <span className="grid-expand__overlay-eyebrow">
                  <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  {content.cellB.eyebrow}
                </span>
              )}
              <h2 className="grid-expand__overlay-title">
                {content.cellB?.expandedTitle}
              </h2>
              {content.cellB?.expandedSubtitle && (
                <p className="grid-expand__overlay-desc">
                  {content.cellB.expandedSubtitle}
                </p>
              )}
              {content.cellB?.ctaText && (
                <div className="grid-expand__overlay-actions">
                  <a
                    href={content.cellB.ctaHref || "#"}
                    className="button-primary"
                  >
                    {content.cellB.ctaText}
                    <ArrowRight size={15} style={{ marginLeft: 6 }} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── CELL C: Row 2, Col 1 (Large, prominent) ── */}
          <div
            ref={cellCRef}
            className="grid-expand__cell grid-expand__cell--c"
            aria-label={content.cellC?.title}
          >
            <div className="grid-expand__bg-mesh grid-expand__bg-mesh--c" />
            <div className="grid-expand__content">
              {content.cellC?.tag && (
                <span className="grid-expand__tag">{content.cellC.tag}</span>
              )}
              <div>
                <h3 className="grid-expand__title">{content.cellC?.title}</h3>
                <p className="grid-expand__desc">{content.cellC?.description}</p>
              </div>
            </div>
          </div>

          {/* ── CELL D: Row 2, Col 2 (Tall, narrow) ── */}
          <div
            ref={cellDRef}
            className="grid-expand__cell grid-expand__cell--d"
            aria-label={content.cellD?.title}
          >
            <div className="grid-expand__bg-mesh grid-expand__bg-mesh--d" />
            <div className="grid-expand__content">
              {content.cellD?.tag && (
                <span className="grid-expand__tag">{content.cellD.tag}</span>
              )}
              <div>
                <h3 className="grid-expand__title">{content.cellD?.title}</h3>
                <p className="grid-expand__desc">{content.cellD?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export default GridExpandSection;
