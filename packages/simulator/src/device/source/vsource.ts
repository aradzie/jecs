import type { Op } from "../../circuit/ops";
import { Device } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Props } from "../../circuit/props";
import { Unit } from "../../util/unit";

export interface VSourceProps {
  readonly V: number;
}

/**
 * Voltage source.
 */
export class VSource extends Device<VSourceProps> {
  static override readonly id = "V";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    V: Props.number({ title: "voltage" }),
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
    const { V } = props;
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override ops(): readonly Op[] {
    const { props, branch } = this;
    const { V } = props;
    const current = branch.current;
    const power = V * current;
    return [
      { name: "Vd", value: V, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
