import type { Node, Stamper } from "../network";
import { Device, DeviceProps, Unit } from "./device";

export interface ISourceProps extends DeviceProps {
  /** Current in amperes. */
  readonly i: number;
}

/**
 * Current source.
 */
export class ISource extends Device {
  static override readonly id = "i";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [{ name: "i", unit: Unit.AMPERE }];

  /** Negative terminal. */
  readonly a: Node;
  /** Positive terminal. */
  readonly b: Node;
  /** Output value in amperes. */
  readonly i: number;

  constructor([a, b]: readonly Node[], { name, i }: ISourceProps) {
    super([a, b], name);
    this.a = a;
    this.b = b;
    this.i = i;
  }

  override stamp(stamper: Stamper): void {
    stamper.stampRightSide(this.a, -this.i);
    stamper.stampRightSide(this.b, this.i);
  }
}
