import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../util/unit";

export interface VCCSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Voltage-controlled current source.
 */
export class VCCSource extends Device {
  static override readonly id = "vccs";
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
  branch!: Branch;

  constructor(
    name: string,
    [np, nn, ncp, ncn]: readonly Node[],
    { gain }: VCCSourceProps,
  ) {
    super(name, [np, nn, ncp, ncn]);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
    this.gain = gain;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch, gain } = this;
    stamper.stampMatrix(np, branch, 1);
    stamper.stampMatrix(nn, branch, -1);
    stamper.stampMatrix(branch, ncp, gain);
    stamper.stampMatrix(branch, ncn, -gain);
    stamper.stampMatrix(branch, branch, -1);
  }

  override details(): Details {
    const { np, nn, branch } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch.current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
    ];
  }
}
