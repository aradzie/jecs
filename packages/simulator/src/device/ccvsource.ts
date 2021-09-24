import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../util/unit";

export interface CCVSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Current-controlled voltage source.
 */
export class CCVSource extends Device {
  static override readonly id = "ccvs";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = [
    { name: "gain", unit: Unit.UNITLESS },
  ];

  /** Positive output terminal. */
  readonly np: Node;
  /** Negative output terminal. */
  readonly nn: Node;
  /** Positive control terminal. */
  readonly ncp: Node;
  /** Negative control terminal. */
  readonly ncn: Node;
  /** Gain. */
  readonly gain: number;
  /** Extra MNA branch. */
  branch1!: Branch;
  /** Extra MNA branch. */
  branch2!: Branch;

  constructor(
    name: string,
    [np, nn, ncp, ncn]: readonly Node[],
    { gain }: CCVSourceProps,
  ) {
    super(name, [np, nn, ncp, ncn]);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
    this.gain = gain;
  }

  override connect(network: Network): void {
    this.branch1 = network.allocBranch(this.ncp, this.ncn);
    this.branch2 = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch1, branch2, gain } = this;
    stamper.stampMatrix(ncp, branch1, 1);
    stamper.stampMatrix(ncn, branch1, -1);
    stamper.stampMatrix(branch1, np, 1);
    stamper.stampMatrix(branch1, nn, -1);
    stamper.stampMatrix(branch1, branch1, -gain);
    stamper.stampMatrix(np, branch2, 1);
    stamper.stampMatrix(nn, branch2, -1);
    stamper.stampMatrix(branch2, ncp, -1);
    stamper.stampMatrix(branch2, ncn, 1);
  }

  override details(): Details {
    const { np, nn, branch2 } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch2.current;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
