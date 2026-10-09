import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { PageContainer } from "./layout/PageContainer";
import "./SystemSection.css";

interface ConceptNode {
  label: string;
  icon?: string;
  active?: boolean;
  center?: boolean;
}

const rows: ConceptNode[][] = [
  [
    { label: "Long-term goals" },
    { label: "Available time" },
    { label: "Meetings" },
  ],
  [
    { label: "Tasks", icon: "✅", active: true },
    { label: "Priorities" },
  ],
  [
    { label: "Energy" },
    { label: "Calendar", icon: "🗓️", active: true },
    { label: "Unexpected work" },
  ],
  [
    { label: "Life OS", icon: "✦", active: true, center: true },
    { label: "Focus", icon: "🎯", active: true },
  ],
  [
    { label: "Morning routine" },
    { label: "Habits" },
    { label: "Commitments" },
  ],
  [{ label: "AI memory" }, { label: "Evening shutdown" }],
];

const rowRotations = [-0.8, 0.5, -1.1, 0.7, -0.5, 0.9];

const webThreads: [number, number][][] = [
  [[-100, 150], [1100, 440]],
  [[-100, 450], [1100, 180]],
  [[-100, 60], [1100, 330]],
  [[-100, 570], [1100, 330]],
  [[-100, 300], [1100, 560]],
  [[-100, 520], [1100, 90]],
];

export function SystemSection() {
  const { ref, inView } = useInView();

  return (
    <section
      className="section-padding sysBand"
      aria-label="One system for your day"
    >
      <PageContainer>
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="sysTitle"
        >
          Your day is one system.
          <br />
          Your tools should act like it.
        </motion.h2>

        <div className="sysNetwork">
          <svg
            className="sysNetwork__web"
            viewBox="0 0 1000 620"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {webThreads.map((line, i) => (
              <motion.line
                key={i}
                x1={line[0][0]}
                y1={line[0][1]}
                x2={line[1][0]}
                y2={line[1][1]}
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.04 }}
              />
            ))}
          </svg>

          <div className="sysNetwork__cluster">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`sysNetwork__row${
                  rowIndex % 2 === 1 ? " sysNetwork__row--offset" : ""
                }`}
              >
                <motion.span
                  className="sysRowString"
                  style={{
                    transform: `translateY(-50%) rotate(${rowRotations[rowIndex]}deg)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 + rowIndex * 0.06 }}
                />
                {row.map((node, nodeIndex) => (
                  <motion.span
                    key={node.label}
                    className={`sysChip${
                      node.center
                        ? " sysChip--center sysChip--active"
                        : node.active
                          ? " sysChip--active"
                          : ""
                    }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: 0.5,
                      delay: 0.25 + rowIndex * 0.08 + nodeIndex * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {node.icon && (
                      <span
                        className={`sysChip__icon${
                          node.center ? " sysChip__icon--accent" : ""
                        }`}
                      >
                        {node.icon}
                      </span>
                    )}
                    {node.label}
                  </motion.span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="sysCopy"
        >
          Life OS connects your tasks, calendar, habits, focus and daily context
          — then helps you decide what deserves your attention now.
        </motion.p>
      </PageContainer>
    </section>
  );
}
