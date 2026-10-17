import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import type { ShowcaseData } from "../../data/showcases";
import { PageContainer } from "../layout/PageContainer";
import "./FeatureShowcase.css";

interface Props {
  data: ShowcaseData;
  children: ReactNode;
}

export function FeatureShowcase({ data, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className={`fs fs--${data.theme}`} aria-label={data.title}>
      <PageContainer>
        {/* 1. Heading */}
        <motion.div
          className="fs__header"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="fs__title">{data.title}</h2>
        </motion.div>

        <div className="fs__divider" />

        {/* 2. Supporting paragraph */}
        <motion.p
          className="fs__description"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {data.description}
        </motion.p>

        {/* 3. Product visual / dashboard mockup */}
        <motion.div
          className={`fs__visual fs__visual--${data.theme}`}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="fs__canvas-content">{children}</div>
        </motion.div>

        {/* 4. Tags / chips */}
        <div className="fs__tags">
          {data.tags.map((tag, i) => (
            <motion.span
              key={tag}
              className="fs__tag"
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: 0.4 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* 5. CTA at the bottom */}
        <motion.div
          className="fs__action"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <a href="#demo" className="button-secondary button-sm">
            {data.cta}
          </a>
        </motion.div>
      </PageContainer>
    </section>
  );
}
