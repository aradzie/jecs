import { clsx } from "clsx";
import { render } from "katex";
import { JSX } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { Point } from "../graphics/geometry.ts";
import { Align } from "../symbol/align.ts";
import { Formula } from "./formula.ts";
import * as styles from "./FormulaDisplay.module.css";

export function FormulaDisplay({ formula, selected }: { formula: Formula; selected: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    render(formula.text, ref.current!, {
      output: "mathml",
      displayMode: true,
    });
    const { width, height } = ref.current!.getBoundingClientRect();
    formula.setSize(width, height);
  }, [formula, formula.text]);
  return (
    <div
      ref={ref}
      class={clsx(styles.root, selected && styles.selected)}
      style={getStyle(formula, formula.align)}
    />
  );
}

function getStyle({ x, y }: Point, align: Align): JSX.CSSProperties {
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
