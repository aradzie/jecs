import { useEffect, useMemo } from "preact/hooks";
import { library } from "../library/library.ts";
import { Controller, ControllerContext } from "../schematic/controller.ts";
import { InstancesPane } from "../schematic/InstancesPane.tsx";
import { LibraryPane } from "../schematic/LibraryPane.tsx";
import { NodesPane } from "../schematic/NodesPane.tsx";
import { PropertiesPane } from "../schematic/PropertiesPane.tsx";
import { SchematicPane } from "../schematic/SchematicPane.tsx";
import { DialogHost } from "../widget/dialog/index.ts";
import { hotkeys } from "../widget/hotkeys.ts";
import { Toaster } from "../widget/toast/index.ts";
import { ToolWindow } from "../widget/ToolWindow.tsx";
import * as styles from "./App.module.css";
import { loadSchematic } from "./load.ts";
import { ToolbarPane } from "./ToolbarPane.tsx";

export function App() {
  const controller = useMemo(() => new Controller(library, loadSchematic()), []);
  useEffect(() => {
    const handler = hotkeys(
      ["Alt+v", () => {}],
      ["Alt+h", () => {}],
      ["Alt+r", () => {}],
      ["Alt+l", () => {}],
      ["Ctrl+a", () => {}],
      ["Ctrl+s", () => {}],
      ["Ctrl+o", () => {}],
      ["Ctrl+n", () => {}],
      ["Ctrl+r", () => {}],
    );
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [controller]);
  return (
    <ControllerContext value={controller}>
      <main class={styles.root}>
        <div class={styles.toolbar}>
          <ToolbarPane />
        </div>
        <div class={styles.schematic}>
          <SchematicPane />
        </div>
        <ToolWindow
          title={"Instances"}
          style={{
            insetInlineEnd: "38rem",
            insetBlockStart: "4rem",
            inlineSize: "15rem",
          }}
        >
          <InstancesPane />
        </ToolWindow>
        <ToolWindow
          title={"Nodes"}
          style={{
            insetInlineEnd: "20rem",
            insetBlockStart: "4rem",
            inlineSize: "15rem",
          }}
        >
          <NodesPane />
        </ToolWindow>
        <ToolWindow
          title={"Library"}
          style={{
            insetInlineEnd: "2rem",
            insetBlockStart: "4rem",
            inlineSize: "15rem",
          }}
        >
          <LibraryPane />
        </ToolWindow>
        <ToolWindow
          title={"Properties"}
          style={{
            insetInlineStart: "2rem",
            insetBlockStart: "4rem",
          }}
        >
          <PropertiesPane />
        </ToolWindow>
      </main>
      <DialogHost />
      <Toaster />
    </ControllerContext>
  );
}
