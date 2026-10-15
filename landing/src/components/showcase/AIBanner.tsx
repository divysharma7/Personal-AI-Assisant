import {
  Sparkles,
  MessageSquare,
  CircleCheck,
} from "lucide-react";
import "./ai-banner.css";

const features = [
  {
    icon: Sparkles,
    title: "AI brief on your dashboard",
    description: "Summarizes priorities, habits at risk, and focus time.",
  },
  {
    icon: MessageSquare,
    title: "Memory across sessions",
    description: "Remembers context so you don't repeat yourself.",
  },
  {
    icon: CircleCheck,
    title: "Capacity awareness",
    description: "Warns you before you overcommit.",
  },
  {
    icon: Sparkles,
    title: "Daily summaries",
    description: "What you did, what's next, what's at risk.",
  },
];

export function AIBannerInner() {
  return (
    <div className="ai-banner__inner">
      <div className="ai-banner__features">
        {features.map(({ icon: Icon, title, description }) => (
          <div className="ai-feature" key={title}>
            <div className="ai-feature__icon" aria-hidden="true">
              <Icon size={18} strokeWidth={1.8} />
            </div>

            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="assistant-demo">
        <div className="assistant-demo__header">
          <span className="assistant-demo__status" aria-hidden="true" />
          <span>AI assistant</span>
        </div>

        <div className="assistant-demo__body">
          <div className="assistant-demo__user">
            What should I focus on today?
          </div>

          <div className="assistant-demo__answer">
            You have 3 tasks due. Your top priority is Ship auth bugfix.
            It's blocking the team. You've focused 2h 15m so far.
          </div>

          <div className="assistant-demo__actions">
            <button type="button">Start focus session</button>
            <button type="button">Show my habits</button>
            <button type="button">Plan tomorrow</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIBanner() {
  return (
    <section className="ai-banner" aria-label="AI assistant capabilities">
      <div className="ai-banner__grid" aria-hidden="true" />
      <AIBannerInner />
    </section>
  );
}
