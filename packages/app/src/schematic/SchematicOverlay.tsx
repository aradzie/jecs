import { render } from "preact";
import { useImperativeHandle, useRef } from "preact/hooks";
import { useController } from "./controller.ts";
import { Element } from "./element.ts";
import { Formula } from "./formula.ts";
import { FormulaDisplay } from "./FormulaDisplay.tsx";
import { Note } from "./note.ts";
import { NoteDisplay } from "./NoteDisplay.tsx";
import * as styles from "./SchematicOverlay.module.css";

export type Measure = {
  updateSize: (element: Element) => void;
};

export function SchematicOverlay() {
  const controller = useController();
  const div = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    controller.measureRef,
    () => ({
      updateSize: (element) => {
        if (element instanceof Formula) {
          const c = document.createElement("div");
          div.current!.appendChild(c);
          render(
            <FormulaDisplay
              formula={element}
              text={element.text}
              align={element.align}
              x={0}
              y={0}
              width={0}
              height={0}
              selected={false}
            />,
            c,
          );
          div.current!.removeChild(c);
        }
        if (element instanceof Note) {
          const c = document.createElement("div");
          div.current!.appendChild(c);
          render(
            <NoteDisplay
              note={element}
              text={element.text}
              align={element.align}
              x={0}
              y={0}
              width={0}
              height={0}
              selected={false}
            />,
            c,
          );
          div.current!.removeChild(c);
        }
      },
    }),
    [controller],
  );
  const { schematic, zoom, selection } = useController();
  return (
    <div
      ref={div}
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
      {schematic.notes.map((note) => (
        <NoteDisplay
          key={note.id}
          note={note}
          text={note.text}
          align={note.align}
          x={note.x}
          y={note.y}
          width={note.width}
          height={note.height}
          selected={selection.has(note)}
        />
      ))}
    </div>
  );
}
