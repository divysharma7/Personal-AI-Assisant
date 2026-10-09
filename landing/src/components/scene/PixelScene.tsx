import { useRef } from "react";
import { PixelSprite } from "./PixelSprite";
import { cat, catEyes, walker, ranger, hanger, jumper } from "./pixelArt";
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
      <div className="pixelScene__grid" />

      <div className="pixelScene__topMark">
        <span className="pixelScene__topMarkCore" />
      </div>

      <div className="pixelScene__world">
        {/* LEFT WORLD */}
        <div className="pixelScene__edge pixelScene__edge--left">
          <div className="pixelScene__block pixelScene__block--leftMain" />
          <div className="pixelScene__block pixelScene__block--leftSecond" />
          <div className="pixelScene__block pixelScene__block--leftTiny" />
          <div className="pixelScene__diamond pixelScene__diamond--left" />

          <div className="pixelScene__cat">
            <PixelSprite art={cat} pixel={4} />
            <PixelSprite art={catEyes} pixel={4} className="pixelScene__catEyes" />
          </div>

          <PixelSprite
            art={walker}
            pixel={4}
            className="pixelScene__sprite pixelScene__sprite--leftFloor"
          />
        </div>

        {/* CENTER EVENT */}
        <div className="pixelScene__centerEvent">
          <PixelSprite
            art={jumper}
            pixel={4}
            className="pixelScene__sprite pixelScene__sprite--jumper"
          />
          <span className="pixelScene__jumperShadow" />
        </div>

        {/* RIGHT WORLD */}
        <div className="pixelScene__edge pixelScene__edge--right">
          <div className="pixelScene__block pixelScene__block--rightMain" />
          <div className="pixelScene__block pixelScene__block--rightSecond" />
          <div className="pixelScene__diamond pixelScene__diamond--right" />

          <PixelSprite
            art={ranger}
            pixel={4}
            className="pixelScene__sprite pixelScene__sprite--rightFloor"
          />

          <PixelSprite
            art={hanger}
            pixel={4}
            className="pixelScene__sprite pixelScene__sprite--rightTop"
          />
        </div>
      </div>
    </div>
  );
}
