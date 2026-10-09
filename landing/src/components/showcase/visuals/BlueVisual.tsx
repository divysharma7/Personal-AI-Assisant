import { LayoutGrid, Calendar, Flame, CheckCircle2, Zap } from "lucide-react";

/**
 * Blue section visual: a browser window filling the blue canvas.
 * Inside: 3 product module cards (Workspace, Capture, Insights).
 */
export function BlueVisual() {
  return (
    <div className="fs__browser">
      <div className="fs__browser-bar">
        <div className="fs__browser-dot" style={{ background: "#ff5f57" }} />
        <div className="fs__browser-dot" style={{ background: "#febc2e" }} />
        <div className="fs__browser-dot" style={{ background: "#28c840" }} />
      </div>
      <div className="fs__browser-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Workspace card */}
          <div className="fs__card">
            <div className="fs__card__icon" style={{ background: "rgba(255,255,255,0.12)" }}>
              <LayoutGrid size={14} />
            </div>
            <h3 className="fs__card__title">Workspace</h3>
            <p className="fs__card__desc">Dashboard · Today · Tasks</p>
            <div className="mt-2 space-y-1.5">
              <MiniRow label="Ship auth bugfix" />
              <MiniRow label="Review PR #142" />
              <MiniRow label="Write Q4 doc" />
            </div>
          </div>

          {/* Capture card */}
          <div className="fs__card">
            <div className="fs__card__icon" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Calendar size={14} />
            </div>
            <h3 className="fs__card__title">Capture</h3>
            <p className="fs__card__desc">Calendar · Habits · Reminders</p>
            <div className="mt-2 space-y-1.5">
              <MiniHabit icon="🏃" label="Run 5km" streak={12} />
              <MiniHabit icon="📚" label="Read 30m" streak={7} />
              <MiniHabit icon="🧘" label="Meditate" streak={4} />
            </div>
          </div>

          {/* Insights card */}
          <div className="fs__card">
            <div className="fs__card__icon" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Zap size={14} />
            </div>
            <h3 className="fs__card__title">Insights</h3>
            <p className="fs__card__desc">AI Brief · Stats · Focus</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <StatPill label="Focus" value="12h 30m" />
              <StatPill label="Tasks" value="34" />
              <StatPill label="Habits" value="89%" />
              <StatPill label="Streak" value="12d" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={10} style={{ opacity: 0.5 }} />
      <span style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
    </div>
  );
}

function MiniHabit({ icon, label, streak }: { icon: string; label: string; streak: number }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontSize: 11, opacity: 0.7, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 9, opacity: 0.5 }}>
        <Flame size={8} style={{ display: "inline", verticalAlign: "middle" }} /> {streak}
      </span>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded" style={{ padding: "4px 6px", background: "rgba(255,255,255,0.06)" }}>
      <p style={{ fontSize: 9, opacity: 0.5, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{value}</p>
    </div>
  );
}