import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";

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

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Output value in amperes. */
  readonly i: number;

  constructor(
    name: string, //
    [np, nn]: readonly Node[],
    { i }: CSourceProps,
  ) {
    super(name, [np, nn]);
    this.np = np;
    this.nn = nn;
    this.i = i;
  }

  override stamp(stamper: Stamper): void {
    const { np, nn, i } = this;
    stamper.stampCurrentSource(np, nn, i);
  }

  override details(): Details {
    const { nn, np, i } = this;
    const voltage = np.voltage - nn.voltage;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: i, unit: Unit.AMPERE },
    ];
  }
}
