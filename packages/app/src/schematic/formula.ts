import { Area } from "../graphics/geometry.ts";
import { Align, HorizontalAlign, VerticalAlign } from "../symbol/align.ts";
import { Element } from "./element.ts";

export class Formula extends Element {
  #text: string;
  #align: Align;
  #x: number;
  #y: number;
  #width: number;
  #height: number;
  #area: Area | null = null;

  constructor(text: string, align: Align = "lt", x: number = 0, y: number = 0) {
    super();
    this.#text = text;
    this.#align = align;
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
    this.#text = value;
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

  override get x(): number {
    return this.#x;
  }

  override get y(): number {
    return this.#y;
  }

  setSize(width: number, height: number) {
    this.#width = width;
    this.#height = height;
    this.#area = null;
  }

  override get area(): Area {
    return (this.#area ??= this.#getArea());
  }

  override moveTo(x: number, y: number): Formula {
    this.#x = x;
    this.#y = y;
    this.#area = null;
    return this;
  }

  #getArea(): Area {
    let h = this.#align.charAt(0) as HorizontalAlign;
    let v = this.#align.charAt(1) as VerticalAlign;
    let x0 = 0;
    let y0 = 0;
    let x1 = 0;
    let y1 = 0;
    switch (h) {
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
    switch (v) {
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
    return { x0, y0, x1, y1 };
  }
}
