import { useController } from "./controller.ts";
import { NoteDisplay } from "./NoteDisplay.tsx";
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
