import { CheckCircle2, Sparkles, MessageSquare } from "lucide-react";

/**
 * Dark section visual: AI chat panel with benefit list.
 */
export function DarkVisual() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Left: benefit list */}
      <div className="flex flex-col justify-center gap-3">
        <BenefitRow
          icon={<Sparkles size={13} />}
          title="AI Brief on your dashboard"
          desc="Summarizes priorities, habits at risk, and focus time."
        />
        <BenefitRow
          icon={<MessageSquare size={13} />}
          title="Memory across sessions"
          desc="Remembers context so you don't repeat yourself."
        />
        <BenefitRow
          icon={<CheckCircle2 size={13} />}
          title="Capacity awareness"
          desc="Warns you before you overcommit."
        />
        <BenefitRow
          icon={<Sparkles size={13} />}
          title="Daily summaries"
          desc="What you did, what's next, what's at risk."
        />
      </div>

      {/* Right: AI chat panel */}
      <div className="fs__browser" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="fs__browser-bar">
          <div className="fs__browser-dot" style={{ background: "#6366f1" }} />
          <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 6 }}>AI Assistant</span>
        </div>
        <div className="fs__browser-content">
          <ChatBubble role="user" text="What should I focus on today?" />
          <ChatBubble
            role="ai"
            text="You have 3 tasks due. Your top priority is Ship auth bugfix — it's blocking the team. You've focused 2h 15m so far."
          />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["Start focus session", "Show my habits", "Plan tomorrow"].map((action) => (
              <span
                key={action}
                style={{
                  fontSize: 10,
                  padding: "4px 8px",
                  borderRadius: 5,
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#818cf8",
                  cursor: "default",
                }}
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: "rgba(99,102,241,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "#818cf8",
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{title}</h4>
        <p style={{ fontSize: 12, opacity: 0.6, margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
    </div>
  );
}

function ChatBubble({ role, text }: { role: "user" | "ai"; text: string }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      <div style={{
        maxWidth: "85%",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.4,
        background: isUser ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
        color: isUser ? "#c7d2fe" : "rgba(255,255,255,0.75)",
      }}>
        {text}
      </div>
    </div>
  );
}