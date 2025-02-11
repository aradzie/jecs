import { useController } from "./controller.ts";
import { Instance } from "./instance.ts";
import { InstancePropertiesPane } from "./InstancePropertiesPane.tsx";
import { Note } from "./note.ts";
import { NotePropertiesPane } from "./NotePropertiesPane.tsx";
import * as styles from "./PropertiesPane.module.css";
import { Wire } from "./wire.ts";

export function PropertiesPane() {
  const controller = useController();
  const { schematic, selection } = controller;
  const elements = selection.filter(schematic);
  if (elements.length === 1) {
    const [element] = elements;
    if (element instanceof Instance) {
      return <InstancePropertiesPane key={element.id} instance={element} />;
    }
    if (element instanceof Note) {
      return <NotePropertiesPane key={element.id} note={element} />;
    }
    if (element instanceof Wire) {
      return <WirePropertiesPane key={element.id} wire={element} />;
    }
  }
  return (
    <div class={styles.root}>
      <div class={styles.empty}>-</div>
    </div>
  );
}

function WirePropertiesPane({ wire }: { wire: Wire }) {
  return (
    <div class={styles.root}>
      <div class={styles.title}>Wire</div>
    </div>
  );
}
