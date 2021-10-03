import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Branch, Network, Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";

export interface VCVSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Voltage-controlled voltage source.
 */
export class VCVSource extends Device {
  static override readonly id = "vcvs";
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
    { gain }: VCVSourceProps,
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
