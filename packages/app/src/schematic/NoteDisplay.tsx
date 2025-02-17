import { type JSX } from "preact";
import { memo } from "preact/compat";
import { useLayoutEffect, useRef } from "preact/hooks";
import { formatNote } from "../note/format-note.ts";
import { type Align, hAlignOf, vAlignOf } from "../symbol/align.ts";
import { type Dir } from "../symbol/direction.ts";
import { type Note } from "./note.ts";
import * as styles from "./NoteDisplay.module.css";

export const NoteDisplay = memo(NoteDisplay0);

function NoteDisplay0({
  note,
  text,
  align,
  dir,
  x,
  y,
  width,
  height,
}: {
  note: Note;
  text: string;
  align: Align;
  dir: Dir;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current!.setHTMLUnsafe(formatNote(text || "note..."));
  }, [text]);
  useLayoutEffect(() => {
    note.width = ref.current!.offsetWidth;
    note.height = ref.current!.offsetHeight;
  });
  const style = getStyle(x, y, align, dir);
  return (
    <div
      ref={ref}
      class={styles.root}
      style={style}
      data-align={align}
      data-h-align={hAlignOf(align)}
      data-v-align={vAlignOf(align)}
      data-dir={dir}
    />
  );
}

function getStyle(x: number, y: number, align: Align, dir: Dir): JSX.CSSProperties {
  let dx = 0;
  let dy = 0;
  switch (hAlignOf(align)) {
    case "l":
      dx = 0;
      break;
    case "c":
      dx = -50;
      break;
    case "r":
      dx = -100;
      break;
  }
  switch (vAlignOf(align)) {
    case "t":
      dy = 0;
      break;
    case "m":
      dy = -50;
      break;
    case "b":
      dy = -100;
      break;
  }
  let r = 0;
  switch (dir) {
    case "v":
      r = -90;
      break;
    case "h":
      r = 0;
      break;
  }
  return {
    position: "absolute",
    left: x,
    top: y,
    transformOrigin: `${-dx}% ${-dy}%`,
    translate: `${dx}% ${dy}%`,
    rotate: `${r}deg`,
  };
}
