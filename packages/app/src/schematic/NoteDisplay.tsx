import { clsx } from "clsx";
import { JSX } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { formatNote } from "../note/format-note.ts";
import { Align } from "../symbol/align.ts";
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
    ref.current!.setHTMLUnsafe(formatNote(text || "note..."));
    note.width = ref.current!.offsetWidth;
    note.height = ref.current!.offsetHeight;
  }, [note, text]);
  useLayoutEffect(() => {
    if (width === 0 || height === 0) {
      note.width = ref.current!.offsetWidth;
      note.height = ref.current!.offsetHeight;
    }
  }, [note, width, height]);
  return (
    <div
      ref={ref}
      class={clsx(styles.root, selected && styles.selected)}
      style={getStyle(x, y, align)}
    />
  );
}

function getStyle(x: number, y: number, align: Align): JSX.CSSProperties {
  switch (align) {
    case "lt":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "0% 0%",
      };
    case "lm":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "0% -50%",
      };
    case "lb":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "0% -100%",
      };
    case "ct":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% 0%",
      };
    case "cm":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
      };
    case "cb":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -100%",
      };
    case "rt":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "-100% 0%",
      };
    case "rm":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "-100% -50%",
      };
    case "rb":
      return {
        position: "absolute",
        left: x,
        top: y,
        translate: "-100% -100%",
      };
  }
}
