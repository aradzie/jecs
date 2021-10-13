import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Branch, Network, Node, Stamper } from "../circuit/network";
import { Props } from "../circuit/props";
import { Unit } from "../util/unit";

export interface VCVSourceProps {
  readonly gain: number;
}

/**
 * Voltage-controlled voltage source.
 */
export class VCVSource extends Device<VCVSourceProps> {
  static override readonly id = "VCVS";
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
    props: VCVSourceProps,
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
    const { np, nn, ncp, ncn, branch, props } = this;
    const { gain } = props;
    stamper.stampVoltageSource(np, nn, branch, 0);
    stamper.stampMatrix(branch, ncp, -gain);
    stamper.stampMatrix(branch, ncn, gain);
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
