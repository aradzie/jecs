import { Area } from "../graphics/geometry.ts";
import { Pin, transformPin } from "../symbol/pin.ts";
import { Labels, Shape, transformLabels, transformShape } from "../symbol/shape.ts";
import { getSymbolArea, Symbol } from "../symbol/symbol.ts";
import { nextTransform, Transform, TransformOp } from "../symbol/transform.ts";
import { Element } from "./element.ts";
import { Names } from "./names.ts";
import { Props } from "./props.ts";

export class Instance extends Element {
  readonly #symbol: Symbol;
  #name: string;
  #props: Props;
  #x: number;
  #y: number;
  #transform: Transform;
  #shapes: Symbol["shapes"] | null = null;
  #pins: Symbol["pins"] | null = null;
  #labels: Symbol["labels"] | null = null;
  #area: Area | null = null;

  constructor(
    symbol: Symbol,
    name: string = Names.anonymous(symbol.prefix),
    props: Props = Props.create(symbol),
    x: number = 0,
    y: number = 0,
    transform: Transform = 0,
  ) {
    super();
    this.#symbol = symbol;
    this.#name = name;
    this.#props = props;
    this.#x = x;
    this.#y = y;
    this.#transform = transform;
  }

  get symbol(): Symbol {
    return this.#symbol;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = value;
  }

  get props(): Props {
    return this.#props;
  }

  set props(value: Props) {
    this.#props = value;
  }

  override get x(): number {
    return this.#x;
  }

  override get y(): number {
    return this.#y;
  }

  get transform(): Transform {
    return this.#transform;
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
    this.#transform = nextTransform(this.#transform, op);
    this.#shapes = null;
    this.#pins = null;
    this.#labels = null;
    this.#area = null;
  }

  override get area(): Area {
    return (this.#area ??= getSymbolArea(this, this.#x, this.#y));
  }

  get shapes(): readonly Shape[] {
    return (this.#shapes ??= this.#symbol.shapes.map((s) => transformShape(s, this.#transform)));
  }

  get pins(): readonly Pin[] {
    return (this.#pins ??= this.#symbol.pins.map((p) => transformPin(p, this.#transform)));
  }

  get labels(): Labels {
    return (this.#labels ??= transformLabels(this.#symbol.labels, this.#transform));
  }
}
