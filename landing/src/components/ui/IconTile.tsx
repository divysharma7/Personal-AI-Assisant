import type { CSSProperties } from "react";
import "./IconTile.css";

interface IconTileProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
}

export function IconTile({ icon, color, size = "md", className = "", style }: IconTileProps) {
  return (
    <span
      className={`iconTile iconTile--${size} ${className}`.trim()}
      style={{ background: `${color}18`, ...style }}
    >
      {icon}
    </span>
  );
}
