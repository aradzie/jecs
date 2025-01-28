import { Area } from "../graphics/geometry.ts";
import { Element } from "./element.ts";
import { Instance } from "./instance.ts";

export class Wire extends Element {
  #x0: number;
  #y0: number;
  #x1: number;
  #y1: number;
  #area: Area | null;

  constructor(x0: number, y0: number, x1: number, y1: number) {
    super();
    this.#x0 = x0;
    this.#y0 = y0;
    this.#x1 = x1;
    this.#y1 = y1;
    this.#area = null;
  }

  get x0(): number {
    return this.#x0;
  }

  set x0(value: number) {
    this.#x0 = value;
    this.#area = null;
  }

  get y0(): number {
    return this.#y0;
  }

  set y0(value: number) {
    this.#y0 = value;
    this.#area = null;
  }

  get x1(): number {
    return this.#x1;
  }

  set x1(value: number) {
    this.#x1 = value;
    this.#area = null;
  }

  get y1(): number {
    return this.#y1;
  }

  set y1(value: number) {
    this.#y1 = value;
    this.#area = null;
  }

  override get x(): number {
    return this.#x0;
  }

  override get y(): number {
    return this.#y0;
  }

  override get area(): Area {
    return (this.#area ??= {
      x0: Math.min(this.#x0, this.#x1),
      y0: Math.min(this.#y0, this.#y1),
      x1: Math.max(this.#x0, this.#x1),
      y1: Math.max(this.#y0, this.#y1),
    });
  }

  override moveTo(x: number, y: number): Element {
    const w = this.#x1 - this.#x0;
    const h = this.#y1 - this.#y0;
    this.#x0 = x;
    this.#y0 = y;
    this.#x1 = x + w;
    this.#y1 = y + h;
    this.#area = null;
    return this;
  }

  override includes(x: number, y: number): boolean {
    const margin = 3;
    if (this.#y0 === this.#y1) {
      // A horizontal wire.
      const y0 = this.#y0;
      const x0 = Math.min(this.#x0, this.#x1);
      const x1 = Math.max(this.#x0, this.#x1);
      return x0 <= x && x <= x1 && y0 - margin <= y && y <= y0 + margin;
    }
    if (this.#x0 === this.#x1) {
      // A vertical wire.
      const x0 = this.#x0;
      const y0 = Math.min(this.#y0, this.#y1);
      const y1 = Math.max(this.#y0, this.#y1);
      return y0 <= y && y <= y1 && x0 - margin <= x && x <= x0 + margin;
    }
    // A diagonal wire.
    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    const numerator = Math.abs(
      (this.#y1 - this.#y0) * x -
        (this.#x1 - this.#x0) * y +
        this.#x1 * this.#y0 -
        this.#y1 * this.#x0,
    );
    const denominator = Math.sqrt(
      (this.#y1 - this.#y0) * (this.#y1 - this.#y0) + (this.#x1 - this.#x0) * (this.#x1 - this.#x0),
    );
    const distance = numerator / denominator;
    const x0 = Math.min(this.#x0, this.#x1);
    const y0 = Math.min(this.#y0, this.#y1);
    const x1 = Math.max(this.#x0, this.#x1);
    const y1 = Math.max(this.#y0, this.#y1);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1 && distance <= margin;
  }
}

/**
 * Optimizes wires by joining and splitting wire segments.
 * Updates the given list of elements in-place.
 */
export function rewire(elements: Element[]): void {
  const h = new HorizontalLines();
  const v = new VerticalLines();
  // Phase 1: Add wires to horizontal and vertical lines.
  for (const element of elements) {
    if (element instanceof Wire) {
      const { x0, y0, x1, y1 } = element;
      if (y0 === y1) {
        // This is a horizontal wire.
        h.addWire(y0, element);
        continue;
      }
      if (x0 === x1) {
        // This is a vertical wire.
        v.addWire(x0, element);
        continue;
      }
      continue;
    }
  }
  // Phase 2: Split wires at breakpoints.
  for (const element of elements) {
    if (element instanceof Instance) {
      // Add instance pins as breakpoints.
      for (const [name, px, py] of element.pins) {
        const x = element.x + px;
        const y = element.y + py;
        h.split(y, x, elements);
        v.split(x, y, elements);
      }
      continue;
    }
    if (element instanceof Wire) {
      // Add wire ends as breakpoints.
      const { x0, y0, x1, y1 } = element;
      if (x0 === x1 && y0 === y1) {
        // An empty wire.
        continue;
      }
      if (y0 === y1) {
        // This is a horizontal wire.
        v.split(x0, y0, elements);
        v.split(x1, y0, elements);
        continue;
      }
      if (x0 === x1) {
        // This is a vertical wire.
        h.split(y0, x0, elements);
        h.split(y1, x0, elements);
        continue;
      }
      // This is a diagonal wire.
      v.split(x0, y0, elements);
      v.split(x1, y1, elements);
      h.split(y0, x0, elements);
      h.split(y1, x1, elements);
      continue;
    }
  }
  // Phase 3: Merge overlapping wires.
  h.merge();
  v.merge();
  // Phase 4: Delete empty wires.
  let i = 0;
  while (i < elements.length) {
    const element = elements[i];
    if (element instanceof Wire) {
      const { x0, y0, x1, y1 } = element;
      if (x0 === x1 && y0 === y1) {
        elements.splice(i, 1);
        continue;
      }
    }
    i += 1;
  }
}

/** Collects all wires on the same horizontal or vertical line. */
type Line = {
  /** The wires on this line. */
  wires: Wire[];
  /** The points at which the wires should be split. */
  breakpoints: number[];
};

class HorizontalLines {
  readonly lines = new Map<number, Line>();

  addWire(y: number, wire: Wire) {
    const { x0, x1 } = wire;
    wire.x0 = Math.min(x0, x1);
    wire.x1 = Math.max(x0, x1);
    wire.y0 = y;
    wire.y1 = y;
    let line = this.lines.get(y);
    if (line == null) {
      this.lines.set(y, (line = { wires: [], breakpoints: [] }));
    }
    line.wires.push(wire);
  }

  split(y: number, x: number, elements: Element[]) {
    let line = this.lines.get(y);
    if (line != null) {
      line.breakpoints.push(x);
      for (const wire of line.wires) {
        if (wire.x0 < x && x < wire.x1) {
          const next = new Wire(x, y, wire.x1, y);
          elements.push(next);
          line.wires.push(next);
          wire.x1 = x;
        }
      }
    }
  }

  merge() {
    for (const { wires, breakpoints } of this.lines.values()) {
      wires.sort((a, b) => a.x0 - b.x0);
      let i = 1;
      while (i < wires.length) {
        const a = wires[i - 1];
        const b = wires[i];
        const ia = breakpoints.indexOf(a.x1);
        const ib = breakpoints.indexOf(b.x0);
        if ((ia === -1 || ib === -1 || ia !== ib) && a.x1 >= b.x0) {
          b.x0 = a.x0;
          b.x1 = Math.max(a.x1, b.x1);
          a.x1 = a.x0;
        }
        i += 1;
      }
    }
  }
}

class VerticalLines {
  readonly lines = new Map<number, Line>();

  addWire(x: number, wire: Wire) {
    const { y0, y1 } = wire;
    wire.y0 = Math.min(y0, y1);
    wire.y1 = Math.max(y0, y1);
    wire.x0 = x;
    wire.x1 = x;
    let line = this.lines.get(x);
    if (line == null) {
      this.lines.set(x, (line = { wires: [], breakpoints: [] }));
    }
    line.wires.push(wire);
  }

  split(x: number, y: number, elements: Element[]) {
    let line = this.lines.get(x);
    if (line != null) {
      line.breakpoints.push(y);
      for (const wire of line.wires) {
        if (wire.y0 < y && y < wire.y1) {
          const next = new Wire(x, y, x, wire.y1);
          elements.push(next);
          line.wires.push(next);
          wire.y1 = y;
        }
      }
    }
  }

  merge() {
    for (const { wires, breakpoints } of this.lines.values()) {
      wires.sort((a, b) => a.y0 - b.y0);
      let i = 1;
      while (i < wires.length) {
        const a = wires[i - 1];
        const b = wires[i];
        const ia = breakpoints.indexOf(a.y1);
        const ib = breakpoints.indexOf(b.y0);
        if ((ia === -1 || ib === -1 || ia !== ib) && a.y1 >= b.y0) {
          b.y0 = a.y0;
          b.y1 = Math.max(a.y1, b.y1);
          a.y1 = a.y0;
        }
        i += 1;
      }
    }
  }
}
