import type { Branch, Network, Node, Stamper } from "../network";
import { Device, DeviceProps, Unit } from "./device";

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

  constructor([a, b]: readonly Node[], { name, v }: VSourceProps) {
    super([a, b], name);
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
