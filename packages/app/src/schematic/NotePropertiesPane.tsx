import {
  mdiAlignHorizontalCenter,
  mdiAlignHorizontalLeft,
  mdiAlignHorizontalRight,
  mdiAlignVerticalBottom,
  mdiAlignVerticalCenter,
  mdiAlignVerticalTop,
  mdiFormatTextRotationNone,
  mdiFormatTextRotationUp,
} from "@mdi/js";
import { hAlignOf, vAlignOf } from "../symbol/align.ts";
import { Icon } from "../widget/Icon.tsx";
import { IconButton } from "../widget/IconButton.tsx";
import { TextField } from "../widget/TextField.tsx";
import { Toolbar } from "../widget/Toolbar.tsx";
import { useController } from "./controller.ts";
import { type Note } from "./note.ts";
import * as styles from "./NotePropertiesPane.module.css";

export function NotePropertiesPane({ note }: { note: Note }) {
  const controller = useController();
  const h = hAlignOf(note.align);
  const v = vAlignOf(note.align);
  const dir = note.dir;
  return (
    <div class={styles.root}>
      <div class={styles.title}>Note</div>
      <Toolbar class={styles.toolbar}>
        <IconButton
          icon={<Icon shape={mdiAlignHorizontalLeft} size={"24px"} />}
          checked={h === "l"}
          onClick={() => {
            controller.edit({ type: "set-note-align", note, align: `l${v}` });
          }}
        />
        <IconButton
          icon={<Icon shape={mdiAlignHorizontalCenter} size={"24px"} />}
          checked={h === "c"}
          onClick={() => {
            controller.edit({ type: "set-note-align", note, align: `c${v}` });
          }}
        />
        <IconButton
          icon={<Icon shape={mdiAlignHorizontalRight} size={"24px"} />}
          checked={h === "r"}
          onClick={() => {
            controller.edit({ type: "set-note-align", note, align: `r${v}` });
          }}
        />
        <Toolbar.Separator />
        <IconButton
          icon={<Icon shape={mdiAlignVerticalTop} size={"24px"} />}
          checked={v === "t"}
          onClick={() => {
            controller.edit({ type: "set-note-align", note, align: `${h}t` });
          }}
        />
        <IconButton
          icon={<Icon shape={mdiAlignVerticalCenter} size={"24px"} />}
          checked={v === "m"}
          onClick={() => {
            controller.edit({ type: "set-note-align", note, align: `${h}m` });
          }}
        />
        <IconButton
          icon={<Icon shape={mdiAlignVerticalBottom} size={"24px"} />}
          checked={v === "b"}
          onClick={() => {
            controller.edit({ type: "set-note-align", note, align: `${h}b` });
          }}
        />
        <Toolbar.Separator />
        <IconButton
          icon={<Icon shape={mdiFormatTextRotationNone} size={"24px"} />}
          checked={dir === "h"}
          onClick={() => {
            controller.edit({ type: "set-note-dir", note, dir: "h" });
          }}
        />
        <IconButton
          icon={<Icon shape={mdiFormatTextRotationUp} size={"24px"} />}
          checked={dir === "v"}
          onClick={() => {
            controller.edit({ type: "set-note-dir", note, dir: "v" });
          }}
        />
      </Toolbar>
      <TextField
        class={styles.text}
        type={"textarea"}
        value={note.text}
        placeholder={"note..."}
        onChange={(text) => {
          controller.edit({ type: "set-note-text", note, text });
        }}
      />
    </div>
  );
}
