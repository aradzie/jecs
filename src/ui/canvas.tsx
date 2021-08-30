import { RefObject, useEffect, useRef } from "react";
import type { FocusProps, KeyboardProps, MouseProps } from "./props";

export type DrawFunction = (ctx: CanvasRenderingContext2D) => void;

const useCanvas = (draw: DrawFunction): RefObject<HTMLCanvasElement> => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas != null) {
      resizeCanvas(canvas);
      draw(canvas.getContext("2d")!);
    }
  }, [draw]);

  return canvasRef;
};

export interface CanvasProps extends FocusProps, MouseProps, KeyboardProps {
  readonly width?: number;
  readonly height?: number;
  readonly draw: DrawFunction;
}

export const Canvas = (props: CanvasProps) => {
  const { width = 1, height = 1, draw, ...rest } = props;

  const canvasRef = useCanvas(draw);

  return (
    <canvas
      style={{
        display: "block",
        margin: "0px",
        padding: "0px",
      }}
      width={1}
      height={1}
      ref={canvasRef}
      {...rest}
    />
  );
};

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const { width, height } = canvas.parentElement!.getBoundingClientRect();
  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio: ratio = 1 } = window;
    const context = canvas.getContext("2d");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context!.scale(ratio, ratio);
  }
}
