import { motion } from "motion/react";
import { spatialTransition } from "./heroChoreography";

interface ProductCellProps {
  tone: string;
  rect: { left: string; top: string; width: string; height: string };
}

export function ProductCell({ tone, rect }: ProductCellProps) {
  return (
    <motion.div
      className={`matrixCell matrixCell--${tone}`}
      initial={rect}
      animate={rect}
      transition={spatialTransition}
    />
  );
}
