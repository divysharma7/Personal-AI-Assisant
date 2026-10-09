import type { Transition } from "motion/react";
import type { HeroPhase } from "./useHeroSequence";

export const spatialTransition: Transition = {
  duration: 0.8,
  ease: [0.76, 0, 0.24, 1],
};

export interface GridTracks {
  c1: number;
  r1: number;
  r2: number;
  r3: number;
}

const fullTracks: GridTracks = { c1: 67, r1: 30, r2: 18, r3: 52 };
const returnTracks = fullTracks;

export const gridStates: Record<HeroPhase, GridTracks> = {
  full: fullTracks,
  statement: { c1: 25, r1: 16, r2: 6, r3: 78 },
  strip: { c1: 72, r1: 4, r2: 86, r3: 10 },
  return: returnTracks,
};

export function gridStyle(tracks: GridTracks) {
  return {
    gridTemplateColumns: `${tracks.c1}% ${100 - tracks.c1}%`,
    gridTemplateRows: `${tracks.r1}% ${tracks.r2}% ${tracks.r3}%`,
  };
}
