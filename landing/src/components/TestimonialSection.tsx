import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { primaryTestimonial, testimonials } from "../data/testimonials";
import { Quote } from "lucide-react";
import { PageContainer } from "./layout/PageContainer";

export function TestimonialSection() {
  const { ref, inView } = useInView();

  return (
    <section className="section-padding bg-bg-secondary/30">
      <PageContainer>
        <div className="max-w-text mx-auto text-center mb-14 md:mb-20">
          <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-medium uppercase tracking-widest text-accent mb-4"
          >
            What people say
          </motion.span>
        </div>

        {/* Primary testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-[720px] mx-auto text-center mb-12 md:mb-16"
        >
          <Quote size={28} className="text-accent/30 mx-auto mb-5" />
          <blockquote className="text-base md:text-lg text-text-primary leading-relaxed mb-8 font-light">
            "{primaryTestimonial.quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
              {primaryTestimonial.name[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary">
                {primaryTestimonial.name}
              </p>
              <p className="text-xs text-text-muted">
                {primaryTestimonial.role} · {primaryTestimonial.company}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Supporting testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[840px] mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="bg-bg-primary rounded-2xl p-6 border border-border"
            >
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-text-primary">{t.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}