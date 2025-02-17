import { type Shape } from "./shape.ts";

export const arrow = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  size: number = 10,
): Shape[] => {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const a0 = a - Math.PI / 6;
  const a1 = a + Math.PI / 6;
  return [
    ["l", x0, y0, x1, y1],
    ["l", x1, y1, x1 - size * Math.cos(a0), y1 - size * Math.sin(a0)],
    ["l", x1, y1, x1 - size * Math.cos(a1), y1 - size * Math.sin(a1)],
  ];
};
