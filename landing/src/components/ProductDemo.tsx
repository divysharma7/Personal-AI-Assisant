import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "../hooks/useInView";
import {
  LayoutGrid,
  Calendar,
  ListTodo,
  Clock,
  Flame,
  MessageSquare,
  CheckCircle2,
  Circle,
  BarChart2,
  Zap,
  Settings,
} from "lucide-react";
import { PageContainer } from "./layout/PageContainer";
import { LifeOsMark } from "./brand/LifeOsLogo";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "workflow", label: "Workflow" },
  { id: "focus", label: "Focus" },
  { id: "insights", label: "Insights" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProductDemo() {
  const { ref, inView } = useInView();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <section className="section-padding" id="demo" aria-labelledby="demo-title">
      <PageContainer>
        <div className="max-w-text mx-auto text-center mb-14 md:mb-20">
          <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block type-eyebrow text-accent mb-3"
          >
            Product
          </motion.span>
          <motion.h2
            id="demo-title"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="type-section text-text-primary"
          >
            See it in action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="type-body text-text-secondary mt-3"
          >
            Explore the core views that make Life OS your daily operating system.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-[1040px] mx-auto"
        >
          {/* View switcher buttons */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2" role="group" aria-label="Demo view switcher">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Demo window */}
          <div className="rounded-xl border border-border bg-bg-secondary overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-tertiary/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-bg-primary/60 rounded-md px-3 py-1 text-xs text-text-muted">
                  laif-iota.vercel.app/{activeTab === "overview" ? "" : activeTab}
                </div>
              </div>
            </div>

            <div className="flex min-h-[400px] md:min-h-[460px]">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-44 border-r border-border bg-bg-tertiary/30 p-3 gap-0.5">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2 border-b border-border">
                  <LifeOsMark size={18} />
                  <span className="text-xs font-semibold text-text-primary">Life OS</span>
                </div>
                <SidebarItem icon={<LayoutGrid size={14} />} label="Dashboard" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                <SidebarItem icon={<Calendar size={14} />} label="Today" active={activeTab === "workflow"} onClick={() => setActiveTab("workflow")} />
                <SidebarItem icon={<Clock size={14} />} label="Focus" active={activeTab === "focus"} onClick={() => setActiveTab("focus")} />
                <SidebarItem icon={<BarChart2 size={14} />} label="Statistics" active={activeTab === "insights"} onClick={() => setActiveTab("insights")} />
                <SidebarItem icon={<ListTodo size={14} />} label="Tasks" />
                <SidebarItem icon={<Flame size={14} />} label="Habits" />
                <SidebarItem icon={<MessageSquare size={14} />} label="AI Chat" />
                <div className="mt-auto pt-3 border-t border-border">
                  <SidebarItem icon={<Settings size={14} />} label="Settings" />
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 p-4 md:p-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {activeTab === "overview" && <OverviewTab />}
                    {activeTab === "workflow" && <WorkflowTab />}
                    {activeTab === "focus" && <FocusTab />}
                    {activeTab === "insights" && <InsightsTab />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active ? true : undefined}
      className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
        active
          ? "bg-accent/10 text-accent font-medium"
          : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

function OverviewTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Good morning, Divy</h3>
          <p className="text-xs text-text-muted mt-0.5">4 tasks due · 2 habits pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-bg-primary/40 rounded-xl p-3.5 border border-border">
          <span className="text-xs font-medium text-text-secondary block mb-2.5">Today</span>
          <div className="space-y-2">
            <DemoTask done label="Review design mockups" />
            <DemoTask label="Ship auth bugfix" />
            <DemoTask label="Write Q4 planning doc" />
          </div>
        </div>
        <div className="bg-bg-primary/40 rounded-xl p-3.5 border border-border">
          <span className="text-xs font-medium text-text-secondary block mb-2.5">Habits</span>
          <div className="space-y-2">
            <DemoHabit icon="🏃" label="Run 5km" streak={12} checked />
            <DemoHabit icon="📚" label="Read 30 min" streak={7} checked />
            <DemoHabit icon="🧘" label="Meditate" streak={4} />
          </div>
        </div>
      </div>

      <div className="bg-accent/5 rounded-xl p-3.5 border border-accent/10">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap size={12} className="text-accent" />
          <span className="text-xs font-medium text-accent">AI brief</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          You have 4 tasks today. Top priority: <span className="text-text-primary font-medium">Ship auth bugfix</span>. Your run habit streak is at 12 days. Keep it going.
        </p>
      </div>
    </div>
  );
}

function WorkflowTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-text-primary">Today</h3>
        <span className="text-xs text-text-muted">Thursday, Oct 2</span>
      </div>

      <div className="space-y-0">
        {[
          { label: "Morning plan", time: "8:00 AM", type: "ritual", done: true },
          { label: "Ship auth bugfix", time: "9:00 AM", type: "task", done: true },
          { label: "Team standup", time: "10:30 AM", type: "event", done: false },
          { label: "Write Q4 doc", time: "11:00 AM", type: "task", done: false },
          { label: "Lunch", time: "12:30 PM", type: "event", done: false },
          { label: "Focus: Design review", time: "2:00 PM", type: "task", done: false },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 relative">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.done ? "bg-accent" : item.type === "event" ? "bg-blue-400" : item.type === "ritual" ? "bg-amber-400" : "bg-emerald-400"
            }`} />
            <span className={`text-xs flex-1 ${item.done ? "text-text-muted line-through" : "text-text-primary"}`}>
              {item.label}
            </span>
            <span className="text-xs text-text-muted">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusTab() {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-28 h-28 mb-4">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-black/10 dark:text-white/10" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="52" fill="none" stroke="#6366f1" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 52 * 0.65} ${2 * Math.PI * 52}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-text-primary">16:22</span>
          <span className="text-xs text-text-muted">remaining</span>
        </div>
      </div>
      <p className="text-xs text-text-primary font-medium mb-1">Ship auth bugfix</p>
      <p className="text-xs text-text-muted mb-4">Session 2 of 4</p>
      <div className="flex items-center gap-3">
        <span className="text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-medium">Pause</span>
        <span className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted">End session</span>
      </div>
    </div>
  );
}

function InsightsTab() {
  return (
    <div>
      <h3 className="text-sm font-medium text-text-primary mb-4">This week</h3>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Focus time", value: "12h 30m", delta: "+18%" },
          { label: "Tasks done", value: "34", delta: "+7" },
          { label: "Habits hit", value: "89%", delta: "+5%" },
          { label: "Best streak", value: "12d", delta: "running" },
        ].map((s) => (
          <div key={s.label} className="bg-bg-primary/40 rounded-lg p-3 border border-border">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="text-sm font-medium text-text-primary">{s.value}</p>
            <p className="text-xs text-emerald-400">{s.delta}</p>
          </div>
        ))}
      </div>
      <div className="bg-bg-primary/40 rounded-lg p-3 border border-border">
        <p className="text-xs text-text-muted mb-2">Focus time by day</p>
        <div className="flex items-end gap-1.5 h-16">
          {[40, 65, 50, 80, 55, 30, 20].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-accent/60"
                style={{ height: `${h}%` }}
              />
              <span className="text-xs text-text-muted">
                {["M", "T", "W", "T", "F", "S", "S"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoTask({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <CheckCircle2 size={13} className="text-accent flex-shrink-0" aria-hidden="true" />
      ) : (
        <Circle size={13} className="text-text-muted flex-shrink-0" aria-hidden="true" />
      )}
      <span className={`text-xs ${done ? "text-text-muted line-through" : "text-text-primary"}`}>
        {label}
      </span>
    </div>
  );
}

function DemoHabit({
  icon,
  label,
  streak,
  checked,
}: {
  icon: string;
  label: string;
  streak: number;
  checked?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs" aria-hidden="true">{icon}</span>
      <span className="text-xs text-text-primary flex-1">{label}</span>
      <span className="text-xs text-text-muted flex items-center gap-1">
        <Flame size={10} className="text-orange-400" aria-hidden="true" />
        {streak}
      </span>
      <div
        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
          checked ? "bg-accent border-accent" : "border-text-muted"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg width="7" height="7" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}