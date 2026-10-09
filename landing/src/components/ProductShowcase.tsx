import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { products, type Product } from "../data/products";
import "./ProductShowcase.css";

/**
 * Entry offsets per direction — cards start displaced from their
 * final position and animate into place, creating the "assembly" feel.
 */
const entryOffsets: Record<Product["entryFrom"], { x: number; y: number }> = {
  top: { x: 0, y: -50 },
  left: { x: -50, y: 0 },
  right: { x: 50, y: 0 },
  bottom: { x: 0, y: 50 },
};

/**
 * Stagger delay per card index (ms).
 * Hero enters first, then others follow with 80ms gaps.
 */
function staggerDelay(index: number): number {
  return 0.1 + index * 0.08;
}

export function ProductShowcase() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="ps" ref={ref} aria-label="Product capabilities">
      <motion.h2
        className="ps__heading"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        Do it all with <span>Life OS</span>.
      </motion.h2>

      <div className="ps__composition">
        {/* Product cards */}
        {products.map((product, i) => (
          <ProductCard
            key={product.gridArea}
            product={product}
            index={i}
            isInView={isInView}
          />
        ))}

        {/* Decorative blocks */}
        {[1, 2, 3, 4, 5].map((n) => (
          <DecorativeBlock key={n} index={n} isInView={isInView} />
        ))}
      </div>

      {/* Floating diamonds — partially overlap the composition edge */}
      <motion.div
        className="ps__diamond ps__diamond--1"
        initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
        animate={isInView ? { opacity: 1, rotate: 45, scale: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="ps__diamond ps__diamond--2"
        initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
        animate={isInView ? { opacity: 1, rotate: 45, scale: 1 } : {}}
        transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="ps__diamond ps__diamond--3"
        initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
        animate={isInView ? { opacity: 1, rotate: 45, scale: 1 } : {}}
        transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </section>
  );
}

/* ── Sub-components ── */

function ProductCard({
  product,
  index,
  isInView,
}: {
  product: Product;
  index: number;
  isInView: boolean;
}) {
  const offset = entryOffsets[product.entryFrom];
  const variantClass =
    product.variant === "hero"
      ? "ps__card--hero"
      : product.variant === "wide"
        ? "ps__card--wide"
        : product.variant === "tall"
          ? "ps__card--tall"
          : "";

  const areaClass = `ps__card--${product.gridArea}`;

  return (
    <motion.div
      className={`ps__card ${variantClass} ${areaClass}`}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{
        duration: 0.9,
        delay: staggerDelay(index),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="ps__card__icon"
        style={{ background: `${product.color}18`, color: product.color }}
      >
        {product.icon}
      </div>
      <h3 className="ps__card__title">{product.title}</h3>
      <p className="ps__card__desc">{product.description}</p>
    </motion.div>
  );
}

function DecorativeBlock({
  index,
  isInView,
}: {
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      className={`ps__deco ps__deco--${index}`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.7,
        delay: 0.4 + index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      aria-hidden="true"
    />
  );
}