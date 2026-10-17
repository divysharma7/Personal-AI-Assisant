import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";
import { LifeOsMark } from "../brand/LifeOsLogo";
import {
  PixelFlag,
  ClawCrane,
  WhiteCat,
  BlackCat,
  OrangeCat,
  TinyFactory,
  TinyCastle,
} from "../pixel/PixelArtAssets";
import "./HeroTransition.css";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HeroTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const craneRef = useRef<HTMLDivElement>(null);
  const leftCatRef = useRef<HTMLDivElement>(null);
  const rightCatRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Dynamically adjust nav height
    const nav = document.querySelector("header") as HTMLElement | null;
    const navH = nav ? nav.offsetHeight : 64;
    section.style.setProperty("--nav-height", `${navH}px`);

    const ctx = gsap.context(() => {
      // Parallax scroll reactive movement
      gsap.to(craneRef.current, {
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: -40,
        ease: "none",
      });

      gsap.to(headlineRef.current, {
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: -32,
        opacity: 0.25,
        ease: "none",
      });

      if (leftCatRef.current) {
        gsap.to(leftCatRef.current, {
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          y: -20,
          ease: "none",
        });
      }

      if (rightCatRef.current) {
        gsap.to(rightCatRef.current, {
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          y: -24,
          ease: "none",
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mistral-hero-clone"
      aria-label="Life OS Hero"
      id="hero"
    >
      {/* ── Background Subtle Indigo Glow ── */}
      <div className="hero-ambient-glow" aria-hidden="true" />

      {/* ── Top Left Wireframe Concentric Arcs ── */}
      <div className="hero-wireframe-arc-outer" aria-hidden="true" />
      <div className="hero-wireframe-arc-inner" aria-hidden="true" />

      {/* ── Left & Right Guide Lines ── */}
      <div className="hero-guideline-left" aria-hidden="true" />
      <div className="hero-guideline-right" aria-hidden="true" />

      {/* ── Side Characters: Restrained outside main content ── */}
      <div
        ref={leftCatRef}
        className="hero-side-cat-left"
        title="Life OS Guardian (Black Cat)"
        aria-hidden="true"
      >
        <BlackCat />
      </div>
      <div
        ref={rightCatRef}
        className="hero-side-cat-right"
        title="Life OS Companion (White Cat)"
        aria-hidden="true"
      >
        <WhiteCat flip />
      </div>

      {/* ── Top Center: Arcade Claw Crane ── */}
      <div ref={craneRef} className="hero-crane-wrapper">
        <ClawCrane />
      </div>

      {/* ── Center Headline, Supporting Copy & Integrated CTA ── */}
      <div ref={headlineRef} className="hero-center-content">
        <h1 className="hero-clone-headline">
          Life OS <PixelFlag /> is #1
          <br />
          in Productivity AI.
        </h1>

        <p className="hero-supporting-statement">
          The calm operating system for your day: tasks, habits, calendar, and AI.
        </p>

        {/* ── CTA with Interactive Orange Cat Hover Peek ── */}
        <div className="hero-cta-interactive-zone">
          <div className="hero-orange-cat-peek" aria-hidden="true">
            <OrangeCat />
          </div>
          <a
            href="#product"
            className="hero-announcement-pill"
            aria-label="Introducing Life OS"
          >
            <div className="pill-logo-box">
              <LifeOsMark size={16} />
            </div>
            <span className="pill-text">Introducing Life OS</span>
            <ChevronRight size={16} className="pill-chevron" />
          </a>
        </div>
      </div>

      {/* ── Bottom Left Stepped Tower + Tiny Factory ── */}
      <div className="hero-bottom-left">
        <div className="stepped-column-stack">
          <div className="block-yellow-top" />
          <div className="block-orange-bottom" />
        </div>
        <div className="block-yellow-step" />
        <div className="tiny-factory-anchor">
          <TinyFactory />
        </div>
      </div>

      {/* ── Bottom Right Orange Pillar + Diamond + Tiny Castle ── */}
      <div className="hero-bottom-right">
        <div className="tiny-castle-anchor">
          <TinyCastle />
        </div>
        <div className="pillar-with-diamond">
          <div className="rotated-diamond-block" />
          <div className="block-orange-pillar" />
        </div>
      </div>
    </section>
  );
}
