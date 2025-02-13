import { useImperativeHandle, useLayoutEffect, useRef } from "preact/hooks";
import { Canvas, resizeCanvas } from "../graphics/Canvas.tsx";
import { useElementSize } from "../widget/use-element-size.tsx";
import { useController } from "./controller.ts";
import { SchematicOverlay } from "./SchematicOverlay.tsx";
import * as styles from "./SchematicPane.module.css";

export function SchematicPane() {
  const controller = useController();
  const div = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useElementSize(canvas);
  useImperativeHandle(controller.focusRef, () => ({
    focus: () => {
      div.current?.focus();
    },
    blur: () => {
      div.current?.blur();
    },
    get focused() {
      return div.current === document.activeElement;
    },
  }));
  useLayoutEffect(() => {
    if (width > 0 && height > 0) {
      resizeCanvas(canvas.current!);
      controller.attach(canvas.current!);
    }
  }, [controller, width, height]);
  useLayoutEffect(() => {
    if (width > 0 && height > 0) {
      const id = requestAnimationFrame(() => {
        controller.paint();
      });
      return () => {
        cancelAnimationFrame(id);
      };
    }
    return;
  }, [
    controller,
    width,
    height,
    controller.settings,
    controller.schematic,
    controller.zoom,
    controller.selection,
    controller.mouseAction,
  ]);
  return (
    <div
      ref={div}
      class={styles.root}
      tabIndex={0}
      autofocus={true}
      onFocus={controller.handleFocus}
      onBlur={controller.handleBlur}
      onKeyDown={controller.handleKeyDown}
      onKeyUp={controller.handleKeyUp}
    >
      <Canvas
        canvas={canvas}
        onMouseDown={controller.handleMouseDown}
        onMouseMove={controller.handleMouseMove}
        onMouseUp={controller.handleMouseUp}
        onWheel={controller.handleWheel}
        onContextMenu={controller.handleContextMenu}
      />
      <SchematicOverlay />
    </div>
  );
}
