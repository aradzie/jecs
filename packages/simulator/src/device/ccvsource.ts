import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Branch, Network, Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";

export interface CCVSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Current-controlled voltage source.
 */
export class CCVSource extends Device<CCVSourceProps> {
  static override readonly id = "CCVS";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = [
    { name: "gain", unit: Unit.UNITLESS, title: "gain" },
  ];

  /** Positive output terminal. */
  readonly np: Node;
  /** Negative output terminal. */
  readonly nn: Node;
  /** Positive control terminal. */
  readonly ncp: Node;
  /** Negative control terminal. */
  readonly ncn: Node;
  /** Extra MNA branch. */
  private branch1!: Branch;
  /** Extra MNA branch. */
  private branch2!: Branch;

  constructor(
    name: string,
    [np, nn, ncp, ncn]: readonly Node[],
    props: CCVSourceProps,
  ) {
    super(name, [np, nn, ncp, ncn], props);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch1 = network.allocBranch(this.np, this.nn);
    this.branch2 = network.allocBranch(this.ncp, this.ncn);
  }

  override stamp(stamper: Stamper): void {
    const { props, np, nn, branch1, ncp, ncn, branch2 } = this;
    const { gain } = props;
    stamper.stampVoltageSource(np, nn, branch1, 0);
    stamper.stampVoltageSource(ncp, ncn, branch2, 0);
    stamper.stampMatrix(branch1, branch2, -gain);
  }

  override details(): Details {
    const { np, nn, branch1 } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch1.current;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
