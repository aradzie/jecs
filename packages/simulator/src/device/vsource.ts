import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Branch, Network, Node, Stamper } from "../circuit/network";
import { Props } from "../circuit/props";
import { Unit } from "../util/unit";

export interface VSourceProps {
  readonly v: number;
}

/**
 * Voltage source.
 */
export class VSource extends Device<VSourceProps> {
  static override readonly id = "V";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    v: Props.number({ unit: Unit.VOLT, title: "voltage" }),
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(name: string, [np, nn]: readonly Node[], props: VSourceProps) {
    super(name, [np, nn], props);
    this.np = np;
    this.nn = nn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { props, np, nn, branch } = this;
    const { v } = props;
    stamper.stampVoltageSource(np, nn, branch, v);
  }

  override details(): Details {
    const { props, branch } = this;
    const { v } = props;
    const current = branch.current;
    const power = v * current;
    return [
      { name: "Vd", value: v, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
