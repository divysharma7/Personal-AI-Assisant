import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { faqs } from "../data/faq";
import { ChevronDown } from "lucide-react";
import { PageContainer } from "./layout/PageContainer";

export function FAQAccordion() {
  const { ref, inView } = useInView();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-padding bg-bg-secondary/30" id="faq">
      <PageContainer>
        <div className="max-w-text mx-auto text-center mb-14 md:mb-20">
          <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block type-eyebrow text-accent mb-3"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="type-section text-text-primary"
          >
            Questions before you try Life OS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="type-body text-text-secondary mt-3"
          >
            Straight answers. No productivity theatre.
          </motion.p>
        </div>

        <div className="max-w-[760px] mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.03 }}
              >
                <button
                  type="button"
                  id={`faq-trigger-${i}`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left bg-bg-primary rounded-xl px-5 py-4 border border-border hover:border-border-hover transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span className="text-base font-medium text-text-primary">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                    aria-hidden="true"
                  >
                    <ChevronDown size={16} className="text-text-muted" aria-hidden="true" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-4 text-sm text-text-secondary leading-relaxed space-y-3 bg-bg-primary/40 rounded-b-xl border-x border-b border-border">
                        {faq.paragraphs.map((p, pIdx) => (
                          <p
                            key={pIdx}
                            className={
                              p === "No." ||
                              p === "That is fine." ||
                              p === "Not blindly." ||
                              p === "Yes." ||
                              p === "It should not."
                                ? "font-medium text-text-primary text-base"
                                : ""
                            }
                          >
                            {p}
                          </p>
                        ))}

                        {faq.callout && faq.callout.length > 0 && (
                          <div className="rounded-lg border border-accent/25 bg-accent/5 p-4 my-2.5 space-y-1.5">
                            {faq.callout.map((c, cIdx) => (
                              <p
                                key={cIdx}
                                className="font-medium text-text-primary text-sm"
                              >
                                {c}
                              </p>
                            ))}
                          </div>
                        )}

                        {faq.bullets && faq.bullets.length > 0 && (
                          <ul className="space-y-1.5 pl-4 text-text-secondary/90 list-disc">
                            {faq.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}

                        {faq.closing && (
                          <p className="mt-2 text-text-secondary font-medium">
                            {faq.closing}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}