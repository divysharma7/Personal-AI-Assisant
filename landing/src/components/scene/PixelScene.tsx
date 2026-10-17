import { useRef } from "react";
import {
  ClawCrane,
  WhiteCat,
  BlackCat,
  TinyFactory,
  TinyCastle,
} from "../pixel/PixelArtAssets";
import { useHeroAnimationState } from "./useHeroAnimationState";
import "./PixelScene.css";

export function PixelScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate } = useHeroAnimationState(ref);

  return (
    <div
      ref={ref}
      className="pixelScene"
      data-animation={shouldAnimate ? "running" : "paused"}
      aria-hidden="true"
    >
      {/* ── Background Subtle Indigo Wireframe Arc ── */}
      <div className="pixelScene__wireframeArc" />

      {/* ── Top Center Arcade Claw Crane ── */}
      <div className="pixelScene__crane">
        <ClawCrane />
      </div>

      {/* ── Left Edge: Gold/Indigo Tower with White Cat & Tiny Factory ── */}
      <div className="pixelScene__edge pixelScene__edge--left">
        <div className="pixelScene__towerLeft">
          <div className="pixelScene__whiteCatPerch">
            <WhiteCat flip={false} />
          </div>
          <div className="pixelScene__blockGold" />
          <div className="pixelScene__blockIndigoBase" />
        </div>
        <div className="pixelScene__stepIndigo" />
        <div className="pixelScene__factoryAnchor">
          <TinyFactory />
        </div>
      </div>

      {/* ── Right Edge: Indigo Pillar with Rotated Diamond, Black Cat & Castle ── */}
      <div className="pixelScene__edge pixelScene__edge--right">
        <div className="pixelScene__castleAnchor">
          <TinyCastle />
        </div>
        <div className="pixelScene__towerRight">
          <div className="pixelScene__tabbyCatPerch">
            <BlackCat flip />
          </div>
          <div className="pixelScene__diamondRotated" />
          <div className="pixelScene__blockIndigoBase" />
        </div>
      </div>
    </div>
  );
}
