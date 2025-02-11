import { Area } from "../graphics/geometry.ts";
import { transformPin } from "../symbol/pin.ts";
import { transformLabels, transformShape } from "../symbol/shape.ts";
import { getSymbolArea, Symbol } from "../symbol/symbol.ts";
import { nextTransform, Transform, TransformOp } from "../symbol/transform.ts";
import { Element } from "./element.ts";
import { Names } from "./names.ts";
import { defaultProps, Props } from "./props.ts";

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
    props: Props = defaultProps(symbol.device),
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

  get symbol() {
    return this.#symbol;
  }

  get name() {
    return this.#name;
  }

  set name(value: string) {
    this.#name = value;
  }

  get props() {
    return this.#props;
  }

  set props(value: Props) {
    this.#props = value;
  }

  override get x() {
    return this.#x;
  }

  override get y() {
    return this.#y;
  }

  override get area() {
    return (this.#area ??= getSymbolArea(this, this.#x, this.#y));
  }

  override moveTo(x: number, y: number): Instance {
    this.#x = x;
    this.#y = y;
    this.#area = null;
    return this;
  }

  get transform() {
    return this.#transform;
  }

  transformBy(op: TransformOp): Instance {
    this.#transform = nextTransform(this.#transform, op);
    this.#shapes = null;
    this.#pins = null;
    this.#labels = null;
    this.#area = null;
    return this;
  }

  get shapes() {
    return (this.#shapes ??= this.#symbol.shapes.map((s) => transformShape(s, this.#transform)));
  }

  get pins() {
    return (this.#pins ??= this.#symbol.pins.map((p) => transformPin(p, this.#transform)));
  }

  get labels() {
    return (this.#labels ??= transformLabels(this.#symbol.labels, this.#transform));
  }
}
