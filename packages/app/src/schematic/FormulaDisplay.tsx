import { clsx } from "clsx";
import { render } from "katex";
import { useLayoutEffect, useRef } from "preact/hooks";
import { round } from "../graphics/geometry.ts";
import { Align, HorizontalAlign, VerticalAlign } from "../symbol/align.ts";
import { Formula } from "./formula.ts";
import * as styles from "./FormulaDisplay.module.css";

export function FormulaDisplay({
  formula,
  text,
  align,
  x,
  y,
  width,
  height,
  selected,
}: {
  formula: Formula;
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
    render(text, ref.current!, {
      output: "mathml",
      displayMode: true,
    });
    formula.width = ref.current!.offsetWidth;
    formula.height = ref.current!.offsetHeight;
  }, [formula, text, align]);
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
