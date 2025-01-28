import { Area } from "../graphics/geometry.ts";
import { Unique } from "./unique.ts";

/**
 * Schematics consist of elements. Elements are instances, wires, formulas, notes, etc.
 */
export abstract class Element extends Unique {
  abstract get x(): number;

  abstract get y(): number;

  abstract get area(): Area;

  moveTo(x: number, y: number): Element {
    return this;
  }

  /** Tests whether this element can be selected by clicking on the given point. */
  includes(x: number, y: number): boolean {
    const { x0, y0, x1, y1 } = this.area;
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }
}
