import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../util/unit";

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

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Output value in volts. */
  readonly v: number;
  /** Extra MNA branch. */
  branch!: Branch;

  constructor(
    name: string, //
    [np, nn]: readonly Node[],
    { v }: VSourceProps,
  ) {
    super(name, [np, nn]);
    this.np = np;
    this.nn = nn;
    this.v = v;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { np, nn, branch, v } = this;
    stamper.stampVoltageSource(np, nn, branch, v);
  }

  override details(): Details {
    const { np, nn, branch } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch.current;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
