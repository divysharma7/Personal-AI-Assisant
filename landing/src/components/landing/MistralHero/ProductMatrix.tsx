import { matrixCells, cellLayouts, type CellLayout } from "./heroContent";
import { ProductCell } from "./ProductCell";
import type { HeroPhase } from "./useHeroSequence";

interface ProductMatrixProps {
  phase: HeroPhase;
}

function cellRect(layout: CellLayout[], cell: CellLayout) {
  const cols = Math.max(...layout.map((l) => l.col + l.colSpan - 1));
  const rows = Math.max(...layout.map((l) => l.row + l.rowSpan - 1));

  return {
    left: `${((cell.col - 1) / cols) * 100}%`,
    top: `${((cell.row - 1) / rows) * 100}%`,
    width: `${(cell.colSpan / cols) * 100}%`,
    height: `${(cell.rowSpan / rows) * 100}%`,
  };
}

export function ProductMatrix({ phase }: ProductMatrixProps) {
  const layout = cellLayouts[phase];

  return (
    <div className="productMatrix">
      {matrixCells.map((cell) => {
        const cellLayout = layout.find((l) => l.id === cell.id);
        if (!cellLayout) return null;

        return (
          <ProductCell
            key={cell.id}
            tone={cell.tone}
            rect={cellRect(layout, cellLayout)}
          />
        );
      })}
    </div>
  );
}
