import { useController } from "./controller.ts";
import { FormulaDisplay } from "./FormulaDisplay.tsx";
import * as styles from "./SchematicOverlay.module.css";

export function SchematicOverlay() {
  const { schematic, zoom, selection } = useController();
  return (
    <div
      class={styles.root}
      style={{
        transformOrigin: `0px 0px`,
        translate: `${zoom.x}px ${zoom.y}px`,
        scale: `${zoom.scale}`,
      }}
    >
      {schematic.formulas.map((formula) => (
        <FormulaDisplay
          key={formula.id}
          formula={formula}
          text={formula.text}
          align={formula.align}
          x={formula.x}
          y={formula.y}
          width={formula.width}
          height={formula.height}
          selected={selection.has(formula)}
        />
      ))}
    </div>
  );
}
