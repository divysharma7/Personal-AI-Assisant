import { motion } from "motion/react";

interface ProductSectionProps {
  theme: "blue" | "white" | "gold" | "black";
  number: string;
  title: string;
  headline: string;
  description: string;
  tags: string[];
}

const themeStyles = {
  blue: {
    background: "#4267ed",
    color: "#fff",
    tagColor: "rgba(255, 255, 255, 0.6)",
  },
  white: {
    background: "#f4f3ef",
    color: "#0a0a0d",
    tagColor: "rgba(10, 10, 13, 0.5)",
  },
  gold: {
    background: "#e8b84f",
    color: "#0a0a0d",
    tagColor: "rgba(10, 10, 13, 0.5)",
  },
  black: {
    background: "#0a0a0d",
    color: "#f0f2f5",
    tagColor: "rgba(240, 242, 245, 0.5)",
  },
};

export function ProductSection({
  theme,
  number,
  title,
  headline,
  description,
  tags,
}: ProductSectionProps) {
  const styles = themeStyles[theme];

  return (
    <motion.section
      className="productSection"
      style={{
        background: styles.background,
        color: styles.color,
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="productSection__inner">
        <div className="productSection__header">
          <span className="productSection__number">{number}</span>
          <h2 className="productSection__title">{title}</h2>
        </div>

        <div className="productSection__content">
          <h3 className="productSection__headline">{headline}</h3>
          <p className="productSection__description">{description}</p>
        </div>

        <div className="productSection__visual">
          <div className="productSection__placeholder">
            <span>Product Screenshot</span>
          </div>
        </div>

        <div className="productSection__tags">
          {tags.map((tag) => (
            <span
              key={tag}
              className="productSection__tag"
              style={{ color: styles.tagColor }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}