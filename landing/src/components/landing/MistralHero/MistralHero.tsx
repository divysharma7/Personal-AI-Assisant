import { motion } from "motion/react";
import { useHeroSequence } from "./useHeroSequence";
import { gridStates, gridStyle, spatialTransition } from "./heroChoreography";
import { HeroHeadline } from "./HeroHeadline";
import { HeroStatement } from "./HeroStatement";
import { ProductMatrix } from "./ProductMatrix";
import { ProductPanel } from "./ProductPanel";
import "./hero.css";

export default function MistralHero() {
  const { phase, isStatic } = useHeroSequence();
  const layout = gridStyle(gridStates[phase]);

  return (
    <section className="mistralHero" aria-label="Introduction and mission">
      <motion.div
        className={`heroGrid${isStatic ? " heroGrid--static" : ""}`}
        data-phase={phase}
        initial={layout}
        animate={layout}
        transition={spatialTransition}
      >
        <HeroHeadline />
        <ProductPanel />
        <ProductMatrix phase={phase} />
        <HeroStatement />
      </motion.div>
    </section>
  );
}
