import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../simulation/props";

export interface VSourceProps extends DeviceProps {
  /** Voltage in volts. */
  readonly v: number;
}

/**
 * Voltage source.
 */
export class VSource extends Device {
  static override readonly id = "v";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [{ name: "v", unit: Unit.VOLT }];

  /** Negative terminal. */
  readonly a: Node;
  /** Positive terminal. */
  readonly b: Node;
  /** Output value in volts. */
  readonly v: number;
  /** Extra MNA branch. */
  branch!: Branch;

  constructor(
    name: string, //
    [a, b]: readonly Node[],
    { v }: VSourceProps,
  ) {
    super(name, [a, b]);
    this.a = a;
    this.b = b;
    this.v = v;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.a, this.b);
  }

  override stamp(stamper: Stamper): void {
    stamper.stampMatrix(this.a, this.branch, -1);
    stamper.stampMatrix(this.b, this.branch, 1);
    stamper.stampMatrix(this.branch, this.a, -1);
    stamper.stampMatrix(this.branch, this.b, 1);
    stamper.stampRightSide(this.branch, this.v);
  }
}
