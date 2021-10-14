import type { Details } from "../../circuit/details";
import { Device } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Props } from "../../circuit/props";
import { Unit } from "../../util/unit";

export interface CCCSourceProps {
  readonly gain: number;
}

/**
 * Current-controlled current source.
 */
export class CCCSource extends Device<CCCSourceProps> {
  static override readonly id = "CCCS";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = {
    gain: Props.number({ title: "gain" }),
  };

  /** Positive output terminal. */
  readonly np: Node;
  /** Negative output terminal. */
  readonly nn: Node;
  /** Positive control terminal. */
  readonly ncp: Node;
  /** Negative control terminal. */
  readonly ncn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(
    name: string,
    [np, nn, ncp, ncn]: readonly Node[],
    props: CCCSourceProps,
  ) {
    super(name, [np, nn, ncp, ncn], props);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.ncp, this.ncn);
  }

  override stamp(stamper: Stamper): void {
    const { props, np, nn, ncp, ncn, branch } = this;
    const { gain } = props;
    stamper.stampVoltageSource(ncp, ncn, branch, 0);
    stamper.stampMatrix(np, branch, gain);
    stamper.stampMatrix(nn, branch, -gain);
  }

  override details(): Details {
    const { props, np, nn, branch } = this;
    const { gain } = props;
    const voltage = np.voltage - nn.voltage;
    const current = branch.current * gain;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
    ];
  }
}
