import { ArrowDown } from "lucide-react";

/**
 * Light section visual: a workflow diagram filling the cream canvas.
 */
export function LightVisual() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full">
      {/* Source block */}
      <FlowBlock
        label="Your Day"
        items={["Tasks", "Meetings", "Habits", "Focus time"]}
      />

      <FlowArrow />

      {/* Process blocks */}
      <div className="flex flex-wrap justify-center gap-3">
        <FlowBlock
          label="Morning Plan"
          items={["Set intention", "Pick top outcome"]}
          accent="#6366f1"
        />
        <FlowBlock
          label="Execute"
          items={["Focus sessions", "Task completion", "Habit check-ins"]}
          accent="#22c55e"
        />
        <FlowBlock
          label="Evening Shutdown"
          items={["Review progress", "Decide carry-forward"]}
          accent="#f59e0b"
        />
      </div>

      <FlowArrow />

      {/* Outcome block */}
      <FlowBlock
        label="Structured Progress"
        items={["Clear priorities", "Measurable focus time", "Building streaks"]}
        wide
      />
    </div>
  );
}

function FlowBlock({
  label,
  items,
  accent,
  wide,
}: {
  label: string;
  items: string[];
  accent?: string;
  wide?: boolean;
}) {
  return (
    <div
      className="fs__card fs__card--light"
      style={{
        minWidth: wide ? 240 : 150,
        maxWidth: wide ? 360 : 190,
        borderColor: accent ? `${accent}40` : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {accent && (
          <div style={{ width: 6, height: 6, borderRadius: 2, background: accent }} />
        )}
        <h4 style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#111" }}>{label}</h4>
      </div>
      {items.map((item) => (
        <p key={item} style={{ fontSize: 11, margin: "2px 0", color: "#555" }}>{item}</p>
      ))}
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <div style={{ width: 1, height: 14, background: "rgba(0,0,0,0.12)" }} />
      <ArrowDown size={12} style={{ opacity: 0.3 }} />
      <div style={{ width: 1, height: 14, background: "rgba(0,0,0,0.12)" }} />
    </div>
  );
}