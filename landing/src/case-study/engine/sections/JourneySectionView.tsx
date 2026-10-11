// src/case-study/engine/sections/JourneySectionView.tsx

import type { JourneySection } from "../types";

export interface JourneySectionViewProps {
  section: JourneySection;
}

export function JourneySectionView({ section }: JourneySectionViewProps) {
  return (
    <section className="journey-section" id={section.id}>
      <header className="journey-section__header">
        {section.eyebrow && <span className="study-overline">{section.eyebrow}</span>}
        {section.title && <h2 className="journey-section__title">{section.title}</h2>}
        {section.description && (
          <p className="journey-note">{section.description}</p>
        )}
      </header>

      <ol className="journey-flow">
        {section.steps.map((step) => (
          <li className="journey-step" key={step.title}>
            <strong className="journey-step__title">{step.title}</strong>
            {step.state && <span className="journey-step__state">{step.state}</span>}
            <p className="journey-step__body">{step.body}</p>
          </li>
        ))}
      </ol>

      {section.note && <p className="journey-note">{section.note}</p>}
    </section>
  );
}
