import { type Area } from "../graphics/geometry.ts";
import { type TransformOp } from "../symbol/transform.ts";
import { Unique } from "./unique.ts";

/**
 * Schematics consist of elements. Elements are instances, wires,
 * notes, etc.
 */
export abstract class Element extends Unique {
  abstract get x(): number;

  abstract get y(): number;

  abstract moveTo(x: number, y: number): void;

  abstract transformBy(op: TransformOp, cx: number, cy: number): void;

  abstract get area(): Area;

  /** Tests whether this element can be selected by clicking on the given point. */
  includes(x: number, y: number): boolean {
    const { x0, y0, x1, y1 } = this.area;
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }
}
