// src/case-study/shell/PhaseNav.tsx

import { NavLink } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";

const phases = [
  { to: "/case-study/life-os", label: "Overview", end: true },
  { to: "/case-study/life-os/discover", label: "01 Discover", end: false },
  { to: "/case-study/life-os/empathize", label: "02 Empathize", end: false },
  { to: "/case-study/life-os/converge", label: "03 Converge", end: false },
  { to: "/case-study/life-os/solution", label: "04 Solution", end: false },
];

export function PhaseNav() {
  return (
    <nav aria-label="Case study phases" className="border-b border-border">
      <PageContainer className="flex flex-wrap items-center gap-2 py-4">
        {phases.map((phase) => (
          <NavLink
            key={phase.to}
            to={phase.to}
            end={phase.end}
            className={({ isActive }) =>
              `rounded-full border px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "border-accent bg-accent text-white"
                  : "border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
              }`
            }
          >
            {phase.label}
          </NavLink>
        ))}
      </PageContainer>
    </nav>
  );
}
