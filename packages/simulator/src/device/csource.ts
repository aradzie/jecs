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
  readonly nn: Node;
  /** Positive terminal. */
  readonly np: Node;
  /** Output value in amperes. */
  readonly i: number;
  /** Voltage difference on the device terminals. */
  voltage = 0;

  constructor(
    name: string, //
    [nn, np]: readonly Node[],
    { i }: CSourceProps,
  ) {
    super(name, [nn, np]);
    this.nn = nn;
    this.np = np;
    this.i = i;
  }

  override stamp(stamper: Stamper): void {
    const { nn, np, i } = this;
    stamper.stampRightSide(nn, -i);
    stamper.stampRightSide(np, i);
  }

  override update(): void {
    this.voltage = Math.abs(this.np.voltage - this.nn.voltage);
  }
}
