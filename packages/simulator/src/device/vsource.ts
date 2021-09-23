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
  readonly nn: Node;
  /** Positive terminal. */
  readonly np: Node;
  /** Output value in volts. */
  readonly v: number;
  /** Extra MNA branch. */
  branch!: Branch;
  /** Current through device. */
  current = 0;
  /** Power produced by device. */
  power = 0;

  constructor(
    name: string, //
    [nn, np]: readonly Node[],
    { v }: VSourceProps,
  ) {
    super(name, [nn, np]);
    this.nn = nn;
    this.np = np;
    this.v = v;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.nn, this.np);
  }

  override stamp(stamper: Stamper): void {
    const { nn, np, branch, v } = this;
    stamper.stampMatrix(nn, branch, -1);
    stamper.stampMatrix(np, branch, 1);
    stamper.stampMatrix(branch, nn, -1);
    stamper.stampMatrix(branch, np, 1);
    stamper.stampRightSide(branch, v);
  }

  override update(): void {
    this.current = -this.branch.current;
    this.power = -(this.v * this.current);
  }
}
