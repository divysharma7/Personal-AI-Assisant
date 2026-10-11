// src/case-study/products/life-os/custom/RepairPreviewDemo.tsx
//
// Interactive recovery fixture Ã¢â‚¬â€ ported from the legacy case-study page so the
// logic survives the dark rebuild. Scenario numbers come from
// 04-solution-design.md "Fixed test case [C]": 13:00Ã¢â‚¬â€œ17:00, 150 task minutes
// available and demanded; the meeting runs 45 minutes late, leaving 105
// available against 150 demand; one valid repair defers the 45-minute launch
// review and keeps the protected routine. Constructed example, not observed.

import { useState } from "react";

type DemoState = "initial" | "disrupted" | "preview" | "accepted";

interface Row {
  name: string;
  time: string;
  kind: "fixed" | "buffer" | "task" | "protected" | "conflict" | "late" | "deferred";
  state: string;
}

const initialRows: Row[] = [
  { name: "Meeting", time: "13:00Ã¢â‚¬â€œ13:30", kind: "fixed", state: "Fixed" },
  { name: "Research synthesis Ã‚Â· 90 min", time: "13:45Ã¢â‚¬â€œ15:15", kind: "task", state: "Planned" },
  { name: "Launch review Ã‚Â· 45 min", time: "15:15Ã¢â‚¬â€œ16:00", kind: "task", state: "Can defer" },
  { name: "Protected routine Ã‚Â· 30 min", time: "16:30Ã¢â‚¬â€œ17:00", kind: "protected", state: "Protected" },
];

const disruptedRows: Row[] = [
  { name: "Meeting Ã‚Â· runs 45 min late", time: "13:00Ã¢â‚¬â€œ14:15", kind: "late", state: "+45 min" },
  { name: "Research synthesis Ã‚Â· 90 min", time: "was 13:45Ã¢â‚¬â€œ15:15", kind: "conflict", state: "Overlaps now" },
  { name: "Launch review Ã‚Â· 45 min", time: "was 15:15Ã¢â‚¬â€œ16:00", kind: "conflict", state: "Overlaps now" },
  { name: "Protected routine Ã‚Â· 30 min", time: "16:30Ã¢â‚¬â€œ17:00", kind: "protected", state: "Protected" },
];

const repairedRows: Row[] = [
  { name: "Meeting Ã‚Â· ran 45 min late", time: "13:00Ã¢â‚¬â€œ14:15", kind: "late", state: "+45 min" },
  { name: "Research synthesis Ã‚Â· 90 min", time: "14:30Ã¢â‚¬â€œ16:00", kind: "task", state: "Moved" },
  { name: "Launch review Ã‚Â· 45 min", time: "deferred", kind: "deferred", state: "Deferred" },
  { name: "Protected routine Ã‚Â· 30 min", time: "16:30Ã¢â‚¬â€œ17:00", kind: "protected", state: "Protected" },
];

const rowStyles: Record<Row["kind"], string> = {
  fixed: "border-border bg-bg-secondary",
  buffer: "border-border bg-bg-secondary",
  task: "border-border bg-bg-secondary",
  protected: "border-[rgba(232,184,79,0.35)] bg-[rgba(232,184,79,0.08)]",
  late: "border-border-hover bg-bg-elevated",
  conflict: "border-[rgba(224,138,123,0.4)] bg-[rgba(224,138,123,0.08)]",
  deferred: "border-dashed border-border-hover bg-transparent",
};

export function RepairPreviewDemo() {
  const [state, setState] = useState<DemoState>("initial");
  const [dismissed, setDismissed] = useState(false);

  const rows =
    state === "initial" ? initialRows : state === "disrupted" ? disruptedRows : repairedRows;

  const available = state === "initial" ? 150 : state === "disrupted" ? 105 : 105;
  const demand = state === "accepted" ? 105 : 150;
  const over = demand - available;

  const label =
    state === "initial"
      ? "Initial plan Ã‚Â· 150 available / 150 planned"
      : state === "disrupted"
        ? "Meeting overrun Ã‚Â· 45 min over capacity"
        : state === "preview"
          ? "Repair preview Ã‚Â· awaiting your call"
          : "Repair accepted Ã‚Â· local demo state";

  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Constructed example [C] Ã‚Â· interactive
          </p>
          <h4 className="mt-3 text-xl font-medium text-text-primary">
            What changes when a meeting runs 45 minutes late?
          </h4>
          <p className="mt-2 text-sm text-text-secondary">
            A local demonstration. Nothing connects to or changes a real calendar.
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-text-primary">13:00Ã¢â‚¬â€œ17:00</div>
          <div className="text-xs uppercase tracking-widest text-text-muted">planning window</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-border px-4 py-3 text-sm text-text-secondary">
        <span>{label}</span>
        <span>
          <b className="text-text-primary">{available}</b> min available
        </span>
        <span>
          <b className="text-text-primary">{demand}</b> min planned
        </span>
        <span className={over > 0 ? "text-[#e08a7b]" : "text-accent-light"}>
          {over > 0 ? `${over} min over capacity` : "0 min over Ã‚Â· fits"}
        </span>
      </div>

      <ul className="mt-4 grid gap-2">
        {rows.map((row) => (
          <li
            key={`${row.name}-${row.time}`}
            className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-4 py-3 text-sm ${rowStyles[row.kind]}`}
          >
            <span className="w-32 shrink-0 text-xs text-text-muted">{row.time}</span>
            <span className="flex-1 text-text-primary">{row.name}</span>
            <span className="text-xs text-text-secondary">{row.state}</span>
          </li>
        ))}
      </ul>

      {state === "preview" && (
        <p className="mt-4 rounded-xl border border-accent bg-accent-soft px-4 py-3 text-sm text-text-primary">
          <b>Proposed repair:</b> move synthesis to 14:30Ã¢â‚¬â€œ16:00, keep the protected
          routine, defer the 45-minute launch review. Result: 105 planned against 105
          available. No tomorrow slot is promised until its availability is checked.
        </p>
      )}
      {state === "accepted" && (
        <p className="mt-4 rounded-xl border border-accent bg-accent-soft px-4 py-3 text-sm text-text-primary">
          Repair accepted in this illustration. Nothing was written to a calendar.
        </p>
      )}
      {dismissed && (
        <p className="mt-4 rounded-xl border border-border px-4 py-3 text-sm text-text-secondary">
          Proposal dismissed. The 45-minute conflict stays visible; the plan has not been
          repaired.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {state === "initial" && (
          <button
            type="button"
            className="btn3d btn3d--sm"
            onClick={() => {
              setState("disrupted");
              setDismissed(false);
            }}
          >
            Meeting runs 45 minutes late
          </button>
        )}
        {state === "disrupted" && (
          <button type="button" className="btn3d btn3d--sm" onClick={() => setState("preview")}>
            Preview repair
          </button>
        )}
        {state === "preview" && (
          <>
            <button
              type="button"
              className="btn3d btn3d--sm"
              onClick={() => {
                setState("accepted");
                setDismissed(false);
              }}
            >
              Accept repair
            </button>
            <button
              type="button"
              className="btn3d btn3d--ghost btn3d--sm"
              onClick={() => {
                setState("disrupted");
                setDismissed(true);
              }}
            >
              Dismiss proposal
            </button>
          </>
        )}
        {state === "accepted" && (
          <button
            type="button"
            className="btn3d btn3d--ghost btn3d--sm"
            onClick={() => {
              setState("disrupted");
              setDismissed(false);
            }}
          >
            Undo repair
          </button>
        )}
        <button
          type="button"
          className="btn3d btn3d--ghost btn3d--sm"
          onClick={() => {
            setState("initial");
            setDismissed(false);
          }}
        >
          Reset scenario
        </button>
      </div>

      <p className="mt-4 text-xs text-text-muted">
        The late meeting stays either way. Undo restores the over-capacity plan while
        retaining the overrun Ã¢â‚¬â€ reversibility is part of the design.
      </p>
    </div>
  );
}
