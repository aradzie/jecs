import { TextField } from "../widget/TextField.tsx";
import { useController } from "./controller.ts";
import { Note } from "./note.ts";
import * as styles from "./NotePropertiesPane.module.css";

export function NotePropertiesPane({ note }: { note: Note }) {
  const controller = useController();
  return (
    <div class={styles.root}>
      <div class={styles.title}>Note</div>
      <TextField
        class={styles.text}
        type={"textarea"}
        value={note.text}
        placeholder={"note text..."}
        onChange={(text) => {
          controller.edit({ type: "set-text", note, text });
        }}
      />
    </div>
  );
}
