import type { CSSProperties } from "react";
import type { PixelArt } from "./pixelArt";

interface PixelSpriteProps {
  art: PixelArt;
  pixel?: number;
  className?: string;
  style?: CSSProperties;
}

export function PixelSprite({ art, pixel = 4, className, style }: PixelSpriteProps) {
  const height = art.map.length;
  const width = Math.max(...art.map.map((row) => row.length));
  const rects = art.map.flatMap((row, y) =>
    row.split("").map((char, x) => {
      const fill = art.palette[char];
      if (!fill) return null;
      return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
    }),
  );

  return (
    <svg
      className={className}
      style={style}
      width={width * pixel}
      height={height * pixel}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}
