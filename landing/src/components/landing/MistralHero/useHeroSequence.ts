import { useEffect, useMemo, useState } from "react";

export type HeroPhase = "full" | "statement" | "strip" | "return";

const STATIC_MEDIA = "(prefers-reduced-motion: reduce), (max-width: 1023px)";

const sequence: { phase: HeroPhase; duration: number }[] = [
  { phase: "full", duration: 3000 },
  { phase: "statement", duration: 2600 },
  { phase: "strip", duration: 2600 },
  { phase: "return", duration: 2400 },
];

function getForcedPhase(): HeroPhase | null {
  const value = new URLSearchParams(window.location.search).get("heroPhase");
  return value && sequence.some((s) => s.phase === value)
    ? (value as HeroPhase)
    : null;
}

function isStaticContext(): boolean {
  return window.matchMedia(STATIC_MEDIA).matches;
}

export function useHeroSequence(): { phase: HeroPhase; isStatic: boolean } {
  const forcedPhase = useMemo(getForcedPhase, []);
  const [index, setIndex] = useState(0);
  const [isStatic, setIsStatic] = useState(() => !forcedPhase && isStaticContext());

  useEffect(() => {
    if (forcedPhase) return;
    const mq = window.matchMedia(STATIC_MEDIA);
    const onChange = () => setIsStatic(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [forcedPhase]);

  useEffect(() => {
    if (forcedPhase || isStatic) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % sequence.length);
    }, sequence[index].duration);

    return () => window.clearTimeout(timer);
  }, [index, forcedPhase, isStatic]);

  const phase = forcedPhase ?? (isStatic ? "full" : sequence[index].phase);

  return { phase, isStatic };
}
