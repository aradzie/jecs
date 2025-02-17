import { type JSX, type RefObject } from "preact";
import { type MouseProps, type WheelProps } from "../widget/props.ts";
import { type Size } from "./geometry.ts";

export type CanvasProps = {
  canvas: RefObject<HTMLCanvasElement>;
  style?: JSX.CSSProperties;
} & MouseProps<HTMLCanvasElement> &
  WheelProps<HTMLCanvasElement>;

export function Canvas({ canvas, style, ...props }: CanvasProps) {
  return (
    <canvas
      {...props}
      ref={canvas}
      style={{
        display: "block",
        inlineSize: "100%",
        blockSize: "100%",
        ...style,
      }}
    />
  );
}

export const resizeCanvas = (canvas: HTMLCanvasElement): Size => {
  const ctx = canvas.getContext("2d")!;
  const scale = devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  const newWidth = Math.max(1, width * scale);
  const newHeight = Math.max(1, height * scale);
  if (canvas.width !== newWidth || canvas.height !== newHeight) {
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.scale(scale, scale);
  }
  return { width: newWidth, height: newHeight };
};
