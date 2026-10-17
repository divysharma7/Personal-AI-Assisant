import { useEffect, useMemo, useState, useCallback, type RefObject } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export type HeroPhase = "full" | "statement" | "strip" | "return";

const STATIC_MEDIA = "(prefers-reduced-motion: reduce), (max-width: 1023px)";

const PHASES: HeroPhase[] = ["full", "statement", "strip", "return"];

function getForcedPhase(): HeroPhase | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("heroPhase");
  return value && PHASES.includes(value as HeroPhase)
    ? (value as HeroPhase)
    : null;
}

function isStaticContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(STATIC_MEDIA).matches;
}

function calculatePhase(progress: number): HeroPhase {
  if (progress < 0.22) {
    return "full";
  }
  if (progress < 0.52) {
    return "statement";
  }
  if (progress < 0.8) {
    return "strip";
  }
  return "return";
}

export function useHeroSequence(trackRef?: RefObject<HTMLElement | null>): {
  phase: HeroPhase;
  isStatic: boolean;
  progress: number;
  scrollToPhase: (phase: HeroPhase) => void;
} {
  const forcedPhase = useMemo(getForcedPhase, []);
  const [phase, setPhase] = useState<HeroPhase>(forcedPhase ?? "full");
  const [progress, setProgress] = useState(0);
  const [isStatic, setIsStatic] = useState(() => !forcedPhase && isStaticContext());

  useEffect(() => {
    if (forcedPhase) return;
    const mq = window.matchMedia(STATIC_MEDIA);
    const onChange = () => setIsStatic(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [forcedPhase]);

  const { scrollYProgress } = useScroll({
    target: trackRef as RefObject<HTMLElement>,
    offset: ["start start", "end end"],
  });

  // Sync phase on scroll
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest);
    if (forcedPhase || isStatic) return;

    const targetPhase = calculatePhase(latest);
    setPhase((current) => (current !== targetPhase ? targetPhase : current));
  });

  // Initial position check on mount
  useEffect(() => {
    if (forcedPhase || isStatic) return;
    const currentProgress = scrollYProgress.get();
    if (currentProgress > 0) {
      setProgress(currentProgress);
      setPhase(calculatePhase(currentProgress));
    }
  }, [forcedPhase, isStatic, scrollYProgress]);

  const scrollToPhase = useCallback(
    (targetPhase: HeroPhase) => {
      const node = trackRef?.current;
      if (!node || typeof window === "undefined") return;

      const rect = node.getBoundingClientRect();
      const trackTop = rect.top + window.scrollY;
      const trackHeight = node.offsetHeight;
      const scrollableDistance = Math.max(0, trackHeight - window.innerHeight);

      const milestoneProgress: Record<HeroPhase, number> = {
        full: 0.05,
        statement: 0.35,
        strip: 0.65,
        return: 0.9,
      };

      const targetScroll =
        trackTop + scrollableDistance * milestoneProgress[targetPhase];
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    },
    [trackRef]
  );

  return {
    phase: forcedPhase ?? (isStatic ? "full" : phase),
    isStatic,
    progress,
    scrollToPhase,
  };
}
