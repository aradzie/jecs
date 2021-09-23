import { Device } from "../simulation/device";
import type { Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../simulation/props";

export interface CSourceProps extends DeviceProps {
  /** Current in amperes. */
  readonly i: number;
}

/**
 * Current source.
 */
export class CSource extends Device {
  static override readonly id = "i";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [{ name: "i", unit: Unit.AMPERE }];

  /** Negative terminal. */
  readonly a: Node;
  /** Positive terminal. */
  readonly b: Node;
  /** Output value in amperes. */
  readonly i: number;

  constructor(
    name: string, //
    [a, b]: readonly Node[],
    { i }: CSourceProps,
  ) {
    super(name, [a, b]);
    this.a = a;
    this.b = b;
    this.i = i;
  }

  override stamp(stamper: Stamper): void {
    stamper.stampRightSide(this.a, -this.i);
    stamper.stampRightSide(this.b, this.i);
  }
}
