import { useEffect, useRef } from "preact/hooks";
import type { Schematic } from "../schematic/schematic.ts";

export function Canvas({ schematic }: { schematic: Schematic }) {
  const element = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = element.current!;
    const context = canvas.getContext("2d")!;
    const ratio = devicePixelRatio;
    const observer = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      const newWidth = Math.max(1, width * ratio);
      const newHeight = Math.max(1, height * ratio);
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        context.scale(ratio, ratio);
        schematic.paint();
      }
    });
    schematic.attach(canvas);
    observer.observe(canvas);
    return () => {
      observer.disconnect();
    };
  }, [schematic]);
  return (
    <canvas
      ref={element}
      style={{
        display: "block",
        inlineSize: "100%",
        blockSize: "100%",
      }}
    />
  );
}
