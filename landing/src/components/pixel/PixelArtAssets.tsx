// 1. Pixel Art Flag (Original Life OS Swallowtail Flag in Signature Indigo & Gold)
export function PixelFlag({ className = "" }: { className?: string }) {
  return (
    <span className={`hero-flag-inline-wrapper ${className}`} aria-label="Life OS Flag">
      <svg
        width="28"
        height="28"
        viewBox="0 0 20 20"
        fill="none"
        shapeRendering="crispEdges"
        className="hero-flag-svg"
        aria-hidden="true"
      >
        {/* Pole Finial (Gold tip) */}
        <rect x="3" y="1" width="2" height="2" fill="#e8b84f" />
        {/* Pole Shaft */}
        <rect x="3" y="3" width="2" height="15" fill="#64748b" />
        <rect x="4" y="3" width="1" height="15" fill="#94a3b8" />
        {/* Flag Pennant - Top Tier: Gold */}
        <rect x="5" y="2" width="11" height="2" fill="#e8b84f" />
        <rect x="5" y="4" width="12" height="3" fill="#f59e0b" />
        <rect x="15" y="3" width="2" height="3" fill="#fbbf24" />
        {/* Flag Pennant - Bottom Tier: Signature Indigo */}
        <rect x="5" y="7" width="13" height="3" fill="#787cf8" />
        <rect x="5" y="10" width="11" height="3" fill="#4338ca" />
        {/* Pennant Flutter Tail */}
        <rect x="16" y="8" width="2" height="3" fill="#6366f1" />
        <rect x="14" y="11" width="2" height="2" fill="#312e81" />
      </svg>
    </span>
  );
}

// 1b. Pixel Black Cat (Obsidian coat, glowing amber eye, Life OS Gold collar & Indigo bell)
export function BlackCat({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      width="36"
      height="40"
      viewBox="0 0 18 20"
      fill="none"
      shapeRendering="crispEdges"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-label="Black Cat"
    >
      {/* Ears */}
      <rect x="9" y="1" width="2" height="3" fill="#334155" />
      <rect x="14" y="1" width="2" height="3" fill="#334155" />
      <rect x="10" y="2" width="1" height="2" fill="#475569" />
      <rect x="14" y="2" width="1" height="2" fill="#475569" />
      {/* Head */}
      <rect x="9" y="4" width="7" height="6" fill="#0f172a" />
      <rect x="8" y="5" width="9" height="4" fill="#0f172a" />
      {/* Eye - Glowing Amber */}
      <rect x="14" y="6" width="2" height="2" fill="#f59e0b" />
      <rect x="14" y="6" width="1" height="1" fill="#fef08a" />
      {/* Life OS Gold Collar with Indigo bell */}
      <rect x="8" y="10" width="8" height="2" fill="#e8b84f" />
      <rect x="11" y="12" width="2" height="1" fill="#787cf8" />
      {/* Body */}
      <rect x="5" y="12" width="10" height="7" fill="#0f172a" />
      <rect x="4" y="14" width="11" height="5" fill="#1e293b" />
      {/* Curled Tail */}
      <rect x="2" y="10" width="2" height="6" fill="#0f172a" />
      <rect x="3" y="9" width="2" height="2" fill="#0f172a" />
      <rect x="4" y="15" width="2" height="2" fill="#0f172a" />
      {/* Paws */}
      <rect x="12" y="18" width="3" height="2" fill="#1e293b" />
      <rect x="8" y="18" width="3" height="2" fill="#1e293b" />
    </svg>
  );
}

// 2. Pixel Arcade Claw Crane (Life OS Indigo housing with Gold accent)
export function ClawCrane({ className = "" }: { className?: string }) {
  return (
    <svg
      width="44"
      height="64"
      viewBox="0 0 24 36"
      fill="none"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {/* Cable */}
      <rect x="11" y="0" width="2" height="13" fill="#64748b" />
      {/* Mount & Housing */}
      <rect x="9" y="13" width="6" height="3" fill="#1e1b4b" />
      <rect x="7" y="16" width="10" height="5" fill="#4338ca" />
      <rect x="8" y="17" width="8" height="3" fill="#787cf8" />
      <rect x="10" y="18" width="4" height="1" fill="#e8b84f" />
      <rect x="10" y="21" width="4" height="2" fill="#475569" />
      {/* Left Claw Prong */}
      <rect x="6" y="22" width="3" height="2" fill="#94a3b8" />
      <rect x="4" y="24" width="3" height="5" fill="#cbd5e1" />
      <rect x="5" y="29" width="3" height="3" fill="#94a3b8" />
      <rect x="8" y="31" width="2" height="2" fill="#e2e8f0" />
      {/* Right Claw Prong */}
      <rect x="15" y="22" width="3" height="2" fill="#94a3b8" />
      <rect x="17" y="24" width="3" height="5" fill="#cbd5e1" />
      <rect x="16" y="29" width="3" height="3" fill="#94a3b8" />
      <rect x="14" y="31" width="2" height="2" fill="#e2e8f0" />
    </svg>
  );
}

// 3. Pixel White Cat (White fur, Life OS Indigo collar with Gold bell)
export function WhiteCat({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      width="36"
      height="40"
      viewBox="0 0 18 20"
      fill="none"
      shapeRendering="crispEdges"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-label="White Cat"
    >
      {/* Ears */}
      <rect x="9" y="1" width="2" height="3" fill="#787cf8" />
      <rect x="14" y="1" width="2" height="3" fill="#787cf8" />
      <rect x="10" y="2" width="1" height="2" fill="#fca5a5" />
      <rect x="14" y="2" width="1" height="2" fill="#fca5a5" />
      {/* Head */}
      <rect x="9" y="4" width="7" height="6" fill="#f8fafc" />
      <rect x="8" y="5" width="9" height="4" fill="#f8fafc" />
      {/* Eye */}
      <rect x="14" y="6" width="2" height="2" fill="#0f172a" />
      <rect x="14" y="6" width="1" height="1" fill="#ffffff" />
      {/* Life OS Indigo Collar with Gold bell */}
      <rect x="8" y="10" width="8" height="2" fill="#787cf8" />
      <rect x="11" y="12" width="2" height="1" fill="#e8b84f" />
      {/* Body */}
      <rect x="5" y="12" width="10" height="7" fill="#f8fafc" />
      <rect x="4" y="14" width="11" height="5" fill="#f8fafc" />
      {/* Curled Tail */}
      <rect x="2" y="10" width="2" height="6" fill="#f8fafc" />
      <rect x="3" y="9" width="2" height="2" fill="#f8fafc" />
      <rect x="4" y="15" width="2" height="2" fill="#f8fafc" />
      {/* Paws */}
      <rect x="12" y="18" width="3" height="2" fill="#e2e8f0" />
      <rect x="8" y="18" width="3" height="2" fill="#e2e8f0" />
    </svg>
  );
}

// 4. Pixel Golden Tabby Cat (Warm amber tones with cream chest)
export function OrangeCat({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      width="46"
      height="40"
      viewBox="0 0 24 20"
      fill="none"
      shapeRendering="crispEdges"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-label="Tabby Cat"
    >
      {/* Ears */}
      <rect x="4" y="1" width="3" height="3" fill="#ea580c" />
      <rect x="5" y="2" width="2" height="2" fill="#fca5a5" />
      <rect x="17" y="1" width="3" height="3" fill="#ea580c" />
      <rect x="17" y="2" width="2" height="2" fill="#fca5a5" />
      {/* Head */}
      <rect x="4" y="4" width="16" height="9" fill="#f59e0b" />
      <rect x="3" y="6" width="18" height="6" fill="#f59e0b" />
      {/* Stripes on forehead */}
      <rect x="11" y="4" width="2" height="3" fill="#b45309" />
      <rect x="8" y="5" width="2" height="2" fill="#b45309" />
      <rect x="14" y="5" width="2" height="2" fill="#b45309" />
      {/* Eyes */}
      <rect x="6" y="7" width="2" height="3" fill="#0f172a" />
      <rect x="6" y="7" width="1" height="1" fill="#ffffff" />
      <rect x="16" y="7" width="2" height="3" fill="#0f172a" />
      <rect x="16" y="7" width="1" height="1" fill="#ffffff" />
      {/* Muzzle & Nose */}
      <rect x="10" y="8" width="4" height="4" fill="#ffedd5" />
      <rect x="11" y="8" width="2" height="1" fill="#ea580c" />
      <rect x="11" y="9" width="2" height="1" fill="#0f172a" />
      {/* Whiskers */}
      <rect x="1" y="8" width="2" height="1" fill="#cbd5e1" />
      <rect x="1" y="10" width="2" height="1" fill="#cbd5e1" />
      <rect x="21" y="8" width="2" height="1" fill="#cbd5e1" />
      <rect x="21" y="10" width="2" height="1" fill="#cbd5e1" />
      {/* Body */}
      <rect x="6" y="13" width="12" height="6" fill="#f59e0b" />
      <rect x="5" y="14" width="14" height="5" fill="#f59e0b" />
      {/* Chest */}
      <rect x="9" y="13" width="6" height="5" fill="#ffedd5" />
      {/* Side Stripes */}
      <rect x="5" y="15" width="2" height="2" fill="#b45309" />
      <rect x="17" y="15" width="2" height="2" fill="#b45309" />
      {/* Paws */}
      <rect x="7" y="18" width="3" height="2" fill="#ffedd5" />
      <rect x="14" y="18" width="3" height="2" fill="#ffedd5" />
      {/* Tail */}
      <rect x="19" y="14" width="2" height="4" fill="#f59e0b" />
      <rect x="20" y="12" width="2" height="3" fill="#b45309" />
    </svg>
  );
}

// 5. Tiny Pixel Factory (Indigo brickwork with glowing Gold windows)
export function TinyFactory({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 18 18"
      fill="none"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="7" width="14" height="11" fill="#312e81" />
      <rect x="3" y="8" width="12" height="9" fill="#4338ca" />
      <rect x="8" y="13" width="3" height="5" fill="#0f172a" />
      <rect x="4" y="10" width="2" height="2" fill="#e8b84f" />
      <rect x="12" y="10" width="2" height="2" fill="#e8b84f" />
      <rect x="4" y="3" width="3" height="4" fill="#1e1b4b" />
      <rect x="11" y="4" width="3" height="3" fill="#1e1b4b" />
      <rect x="5" y="1" width="2" height="2" fill="#787cf8" />
      <rect x="4" y="0" width="1" height="1" fill="#9398fa" />
      <rect x="12" y="2" width="2" height="2" fill="#787cf8" />
    </svg>
  );
}

// 6. Tiny Pixel Castle (Blue fortress with cyan flag)
export function TinyCastle({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="26"
      viewBox="0 0 18 20"
      fill="none"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="1" width="1" height="5" fill="#cbd5e1" />
      <rect x="10" y="1" width="4" height="3" fill="#38bdf8" />
      <rect x="3" y="6" width="3" height="3" fill="#2563eb" />
      <rect x="8" y="6" width="3" height="3" fill="#2563eb" />
      <rect x="13" y="6" width="3" height="3" fill="#2563eb" />
      <rect x="3" y="9" width="13" height="11" fill="#1d4ed8" />
      <rect x="4" y="10" width="11" height="9" fill="#2563eb" />
      <rect x="7" y="14" width="5" height="6" fill="#0f172a" />
      <rect x="8" y="13" width="3" height="1" fill="#0f172a" />
      <rect x="5" y="12" width="1" height="3" fill="#0f172a" />
      <rect x="13" y="12" width="1" height="3" fill="#0f172a" />
    </svg>
  );
}
