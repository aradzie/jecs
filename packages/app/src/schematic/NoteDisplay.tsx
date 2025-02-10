import { clsx } from "clsx";
import { useLayoutEffect, useRef } from "preact/hooks";
import { round } from "../graphics/geometry.ts";
import { formatNote } from "../note/format-note.ts";
import { Align, HorizontalAlign, VerticalAlign } from "../symbol/align.ts";
import { Note } from "./note.ts";
import * as styles from "./NoteDisplay.module.css";

export function NoteDisplay({
  note,
  text,
  align,
  x,
  y,
  width,
  height,
  selected,
}: {
  note: Note;
  text: string;
  align: Align;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current!.setHTMLUnsafe(formatNote(text));
    note.width = ref.current!.offsetWidth;
    note.height = ref.current!.offsetHeight;
  }, [note, text, align]);
  return (
    <div
      ref={ref}
      class={clsx(styles.root, selected && styles.selected)}
      style={getStyle(x, y, width, height, align)}
    />
  );
}

function getStyle(x: number, y: number, width: number, height: number, align: Align) {
  const h = align.charAt(0) as HorizontalAlign;
  const v = align.charAt(1) as VerticalAlign;
  let left = 0;
  let top = 0;
  if (width > 0 && height > 0) {
    switch (h) {
      case "l":
        left = x;
        break;
      case "c":
        left = x - round(width / 2);
        break;
      case "r":
        left = x - width;
        break;
    }
    switch (v) {
      case "t":
        top = y;
        break;
      case "m":
        top = y - round(height / 2);
        break;
      case "b":
        top = y - height;
        break;
    }
  }
  return { position: "absolute", left, top };
}
