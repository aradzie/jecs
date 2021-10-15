import type { Op } from "../../circuit/ops";
import { Device } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Props } from "../../circuit/props";
import { Unit } from "../../util/unit";

export interface VCCSourceProps {
  readonly gain: number;
}

/**
 * Voltage-controlled current source.
 */
export class VCCSource extends Device<VCCSourceProps> {
  static override readonly id = "VCCS";
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
    props: VCCSourceProps,
  ) {
    super(name, [np, nn, ncp, ncn], props);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { props, np, nn, ncp, ncn, branch } = this;
    const { gain } = props;
    stamper.stampMatrix(np, branch, 1);
    stamper.stampMatrix(nn, branch, -1);
    stamper.stampMatrix(branch, ncp, gain);
    stamper.stampMatrix(branch, ncn, -gain);
    stamper.stampMatrix(branch, branch, -1);
  }

  override ops(): readonly Op[] {
    const { np, nn, branch } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch.current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
    ];
  }
}
