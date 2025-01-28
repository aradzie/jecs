import type { Schematic } from "../schematic/schematic.ts";
import * as styles from "./Library.module.css";

export function Library({ schematic }: { schematic: Schematic }) {
  return (
    <div class={styles.root}>
      <Category name={"Linear components"} />
      <Category name={"Nonlinear components"} />
      <Category name={"Sources"} />
      <Category name={"Probes"} />
      <Category name={"Diagrams"} />
      <Category name={"Shapes"} />
    </div>
  );
}

function Category({ name }: { name: string }) {
  return (
    <div class={styles.category}>
      <div class={styles.title}>{name}</div>
      <div class={styles.list}>
        <Symbol />
        <Symbol />
        <Symbol />
        <Symbol />
        <Symbol />
        <Symbol />
      </div>
    </div>
  );
}

function Symbol() {
  return <div class={styles.symbol}></div>;
}
