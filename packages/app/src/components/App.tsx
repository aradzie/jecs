import { useEffect } from "preact/hooks";
import { Schematic } from "../schematic/schematic.ts";
import * as styles from "./App.module.css";
import { Canvas } from "./Canvas.tsx";
import { Library } from "./Library.tsx";
import { Toolbar } from "./Toolbar.tsx";

export function App() {
  const schematic = new Schematic();
  useEffect(() => {
    schematic.listen(window);
  }, [schematic]);
  return (
    <main class={styles.root}>
      <div class={styles.toolbar}>
        <Toolbar schematic={schematic} />
      </div>
      <div class={styles.library}>
        <Library schematic={schematic} />
      </div>
      <div class={styles.canvas}>
        <Canvas schematic={schematic} />
      </div>
    </main>
  );
}
