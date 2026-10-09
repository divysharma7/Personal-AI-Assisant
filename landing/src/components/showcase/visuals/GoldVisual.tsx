import { Timer, Target, BarChart3 } from "lucide-react";

/**
 * Gold section visual: an infrastructure-style focus engine diagram.
 */
export function GoldVisual() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {/* Top row: inputs */}
      <div className="flex flex-wrap justify-center gap-3">
        <InfraNode icon={<Timer size={14} />} label="Pomodoro" sub="25min focus" />
        <InfraNode icon={<Target size={14} />} label="Stopwatch" sub="Open-ended" />
        <InfraNode icon={<BarChart3 size={14} />} label="Manual" sub="Log time" />
      </div>

      {/* Connectors */}
      <div className="flex items-center gap-2">
        <div style={{ width: 30, height: 1, background: "rgba(0,0,0,0.12)" }} />
        <div style={{ width: 8, height: 8, background: "#e67e22", transform: "rotate(45deg)" }} />
        <div style={{ width: 30, height: 1, background: "rgba(0,0,0,0.12)" }} />
      </div>

      {/* Central engine */}
      <div className="fs__card fs__card--gold" style={{ minWidth: 220, textAlign: "center" }}>
        <h4 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px", color: "#111" }}>
          Focus Engine
        </h4>
        <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
          Task-linked sessions with real-time tracking
        </p>
      </div>

      {/* Connectors */}
      <div className="flex items-center gap-2">
        <div style={{ width: 30, height: 1, background: "rgba(0,0,0,0.12)" }} />
        <div style={{ width: 8, height: 8, background: "#e67e22", transform: "rotate(45deg)" }} />
        <div style={{ width: 30, height: 1, background: "rgba(0,0,0,0.12)" }} />
      </div>

      {/* Bottom row: outputs */}
      <div className="flex flex-wrap justify-center gap-3">
        <InfraNode label="High Performance" sub="60fps compositor" small />
        <InfraNode label="Measurable" sub="Session history" small />
        <InfraNode label="Integrated" sub="Tasks & habits" small />
      </div>
    </div>
  );
}

function InfraNode({
  icon,
  label,
  sub,
  small,
}: {
  icon?: React.ReactNode;
  label: string;
  sub: string;
  small?: boolean;
}) {
  return (
    <div className="fs__card fs__card--gold" style={{ minWidth: small ? 120 : 130, textAlign: "center" }}>
      {icon && (
        <div style={{
          width: 28, height: 28, borderRadius: 5,
          background: "rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 6px",
        }}>
          {icon}
        </div>
      )}
      <h4 style={{ fontSize: small ? 12 : 13, fontWeight: 600, margin: "0 0 2px", color: "#111" }}>
        {label}
      </h4>
      <p style={{ fontSize: 10, color: "#777", margin: 0 }}>{sub}</p>
    </div>
  );
}