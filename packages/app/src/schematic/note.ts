import { type Area } from "../graphics/geometry.ts";
import { type Align, hAlignOf, transformAlignBy, vAlignOf } from "../symbol/align.ts";
import { type Dir, transformDirBy } from "../symbol/direction.ts";
import { type TransformOp } from "../symbol/transform.ts";
import { Element } from "./element.ts";

export class Note extends Element {
  #text: string;
  #align: Align;
  #dir: Dir;
  #x: number;
  #y: number;
  #width: number;
  #height: number;
  #area: Area | null = null;

  constructor(text: string, align: Align = "lt", dir: Dir = "h", x: number = 0, y: number = 0) {
    super();
    this.#text = text.trim();
    this.#align = align;
    this.#dir = dir;
    this.#x = x;
    this.#y = y;
    this.#width = 0;
    this.#height = 0;
    this.#area = null;
  }

  get text(): string {
    return this.#text;
  }

  set text(value: string) {
    this.#text = value.trim();
    this.#width = 0;
    this.#height = 0;
    this.#area = null;
  }

  get align(): Align {
    return this.#align;
  }

  set align(value: Align) {
    this.#align = value;
    this.#area = null;
  }

  get dir(): Dir {
    return this.#dir;
  }

  set dir(value: Dir) {
    this.#dir = value;
    this.#area = null;
  }

  override get x(): number {
    return this.#x;
  }

  override get y(): number {
    return this.#y;
  }

  get width(): number {
    return this.#width;
  }

  set width(value: number) {
    this.#width = value;
    this.#area = null;
  }

  get height(): number {
    return this.#height;
  }

  set height(value: number) {
    this.#height = value;
    this.#area = null;
  }

  override moveTo(x: number, y: number): void {
    this.#x = x;
    this.#y = y;
    this.#area = null;
  }

  override transformBy(op: TransformOp, cx: number, cy: number): void {
    const x = this.#x;
    const y = this.#y;
    switch (op) {
      case "rl":
        this.#x = cx + (y - cy);
        this.#y = cy - (x - cx);
        break;
      case "rr":
        this.#x = cx - (y - cy);
        this.#y = cy + (x - cx);
        break;
      case "mx":
        this.#x = 2 * cx - x;
        break;
      case "my":
        this.#y = 2 * cy - y;
        break;
    }
    this.#align = transformAlignBy(this.#align, op);
    this.#dir = transformDirBy(this.#dir, op);
    this.#area = null;
  }

  override get area(): Area {
    return (this.#area ??= this.#getArea());
  }

  #getArea(): Area {
    let x0 = 0;
    let y0 = 0;
    let x1 = 0;
    let y1 = 0;
    switch (this.#dir) {
      case "h":
        switch (hAlignOf(this.#align)) {
          case "l":
            x0 = this.#x;
            x1 = this.#x + this.#width;
            break;
          case "c":
            x0 = this.#x - this.#width / 2;
            x1 = this.#x + this.#width / 2;
            break;
          case "r":
            x0 = this.#x - this.#width;
            x1 = this.#x;
            break;
        }
        switch (vAlignOf(this.#align)) {
          case "t":
            y0 = this.#y;
            y1 = this.#y + this.#height;
            break;
          case "m":
            y0 = this.#y - this.#height / 2;
            y1 = this.#y + this.#height / 2;
            break;
          case "b":
            y0 = this.#y - this.#height;
            y1 = this.#y;
            break;
        }
        break;
      case "v":
        switch (hAlignOf(this.#align)) {
          case "l":
            y0 = this.#y - this.#width;
            y1 = this.#y;
            break;
          case "c":
            y0 = this.#y - this.#width / 2;
            y1 = this.#y + this.#width / 2;
            break;
          case "r":
            y0 = this.#y;
            y1 = this.#y + this.#width;
            break;
        }
        switch (vAlignOf(this.#align)) {
          case "t":
            x0 = this.#x;
            x1 = this.#x + this.#height;
            break;
          case "m":
            x0 = this.#x - this.#height / 2;
            x1 = this.#x + this.#height / 2;
            break;
          case "b":
            x0 = this.#x - this.#height;
            x1 = this.#x;
            break;
        }
        break;
    }
    return { x0, y0, x1, y1 };
  }
}
