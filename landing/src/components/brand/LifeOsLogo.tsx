// Official Brand Identity Component for Life OS.
// Features the distinctive orbital gradient ring and satellite dot
// along with the geometric "Life OS" logotype.

export interface LifeOsLogoProps {
  /** Size in pixels for the logo mark icon (default: 32) */
  size?: number;
  /** Whether to show the "Life OS" brand text beside the mark (default: true) */
  showText?: boolean;
  /** Text color or class override */
  textClassName?: string;
  /** Wrapper className */
  className?: string;
  /** Whether to use the native PNG asset or high-fidelity SVG (default: "png") */
  renderMode?: "png" | "svg";
}

export function LifeOsMark({
  size = 32,
  alt = "",
  className = "",
}: {
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src="/life-os-mark.png"
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      loading="eager"
    />
  );
}

export function LifeOsAppIcon({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/life-os-app-icon.png"
      alt="Life OS App"
      width={size}
      height={size}
      className={`shrink-0 object-contain drop-shadow-md ${className}`}
      style={{ width: size, height: size }}
      loading="eager"
    />
  );
}

export function LifeOsLogo({
  size = 32,
  showText = true,
  textClassName = "",
  className = "",
}: LifeOsLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LifeOsMark size={size} />
      {showText && (
        <span
          className={`font-bold tracking-tight text-lg md:text-xl ${textClassName}`}
          style={{ letterSpacing: "-0.03em" }}
        >
          Life OS
        </span>
      )}
    </div>
  );
}
