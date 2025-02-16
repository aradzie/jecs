import { DeviceClass } from "@jecs/simulator";
import { Area } from "../graphics/geometry.ts";
import { Pin } from "./pin.ts";
import { Labels, Shape } from "./shape.ts";

export type Category = "Conductors" | "Linear" | "Nonlinear" | "Sources" | "Probes";

export type Symbol = Readonly<{
  id: string;
  name: string;
  category: Category;
  prefix: string;
  shapes: readonly Shape[];
  pins: readonly Pin[];
  labels: Labels;
  device: DeviceClass | null;
}>;

export const getSymbolArea = (
  { shapes, pins }: Pick<Symbol, "shapes" | "pins">,
  originX: number,
  originY: number,
): Area => {
  const min = { x: 0, y: 0 };
  const max = { x: 0, y: 0 };
  for (const shape of shapes) {
    switch (shape[0]) {
      case "l": {
        const [_, x0, y0, x1, y1] = shape;
        min.x = Math.min(min.x, x0, x1);
        min.y = Math.min(min.y, y0, y1);
        max.x = Math.max(max.x, x0, x1);
        max.y = Math.max(max.y, y0, y1);
        break;
      }
      case "c": {
        const [_, x, y, r] = shape;
        min.x = Math.min(min.x, x - r, x + r);
        min.y = Math.min(min.y, y - r, y + r);
        max.x = Math.max(max.x, x - r, x + r);
        max.y = Math.max(max.y, y - r, y + r);
        break;
      }
      case "a": {
        const [_, x, y, r, startAngle, endAngle] = shape;
        min.x = Math.min(min.x, x - r, x + r);
        min.y = Math.min(min.y, y - r, x + r);
        max.x = Math.max(max.x, x - r, y + r);
        max.y = Math.max(max.y, y - r, y + r);
        break;
      }
    }
  }
  for (const [_, x, y] of pins) {
    min.x = Math.min(min.x, x);
    min.y = Math.min(min.y, y);
    max.x = Math.max(max.x, x);
    max.y = Math.max(max.y, y);
  }
  return {
    x0: originX + min.x,
    y0: originY + min.y,
    x1: originX + max.x,
    y1: originY + max.y,
  };
};
