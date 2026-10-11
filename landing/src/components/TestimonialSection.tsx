import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { primaryTestimonial, testimonials } from "../data/testimonials";
import { PageContainer } from "./layout/PageContainer";
import { IconTile } from "./ui";

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

        {/* Primary quote slab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-[760px] mx-auto text-center mb-12 md:mb-16"
        >
          <IconTile icon="“" color="#e8b84f" size="lg" className="mx-auto mb-6" />
          <blockquote className="text-xl md:text-2xl lg:text-[26px] leading-[1.45] text-text-primary font-light mb-8">
            "{primaryTestimonial.quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <IconTile icon={primaryTestimonial.name[0]} color="#6366f1" />
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
              className="tile3d p-6"
            >
              <IconTile icon="“" color="#e8b84f" size="sm" className="mb-4" />
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <IconTile icon={t.name[0]} color="#6366f1" size="sm" />
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
