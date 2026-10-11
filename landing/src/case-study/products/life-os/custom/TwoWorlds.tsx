// src/case-study/products/life-os/custom/TwoWorlds.tsx
//
// 02-empathy-deepening.md — "Two different worlds".
// Ananya (Deliberate Planner) vs Rohan (Adaptive Executor), both [S] composites.
// Meera is a satisfied-minimalist comparison, not a persona.

import type { CustomSection } from "../../../engine/types";

export interface Persona {
  name: string;
  archetype: string;
  tint: "warm" | "cool";
  fields: { label: string; value: string }[];
}

export interface TwoWorldsData {
  axis: string;
  caveat: string;
  personas: [Persona, Persona];
  meera: { label: string; body: string };
}

const TINT: Record<Persona["tint"], string> = {
  warm: "border-[rgba(232,184,79,0.4)] bg-[rgba(232,184,79,0.06)]",
  cool: "border-accent bg-accent-soft",
};

const TINT_AVATAR: Record<Persona["tint"], string> = {
  warm: "bg-[rgba(232,184,79,0.15)] text-gold",
  cool: "bg-accent-soft text-accent-light",
};

export function TwoWorlds({ data, section }: { data: unknown; section: CustomSection }) {
  const { axis, caveat, personas, meera } = data as TwoWorldsData;

  return (
    <section className="mx-auto max-w-[1200px] px-6 md:px-10" id={section.id}>
      {section.title && (
        <h2 className="max-w-3xl text-section-mobile font-medium text-text-primary md:text-section">
          {section.title}
        </h2>
      )}
      <p className="mt-5 max-w-text text-base leading-relaxed text-text-secondary">
        <span className="font-medium text-text-primary">Axis: {axis}</span> {caveat}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {personas.map((persona) => (
          <article key={persona.name} className={`rounded-2xl border p-6 md:p-8 ${TINT[persona.tint]}`}>
            <div className="flex items-center gap-4">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${TINT_AVATAR[persona.tint]}`}>
                {persona.name[0]}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{persona.name}</h3>
                <p className="text-xs italic text-text-muted">{persona.archetype}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3">
              {persona.fields.map((field) => (
                <div key={field.label}>
                  <dt className="text-xs font-medium uppercase tracking-widest text-text-muted">{field.label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-text-secondary">{field.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <article className="mt-4 rounded-2xl border border-dashed border-border p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">{meera.label}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">{meera.body}</p>
      </article>
    </section>
  );
}
