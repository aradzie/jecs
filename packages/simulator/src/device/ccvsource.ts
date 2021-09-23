import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../simulation/props";

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

  /** Negative input terminal. */
  readonly nin: Node;
  /** Positive input terminal. */
  readonly nip: Node;
  /** Negative output terminal. */
  readonly non: Node;
  /** Positive output terminal. */
  readonly nop: Node;
  /** Gain. */
  readonly gain: number;
  /** Extra MNA branch. */
  branch1!: Branch;
  /** Extra MNA branch. */
  branch2!: Branch;

  constructor(
    name: string,
    [nin, nip, non, nop]: readonly Node[],
    { gain }: CCVSourceProps,
  ) {
    super(name, [nin, nip, non, nop]);
    this.nin = nin;
    this.nip = nip;
    this.non = non;
    this.nop = nop;
    this.gain = gain;
  }

  override connect(network: Network): void {
    this.branch1 = network.allocBranch(this.nin, this.nip);
    this.branch2 = network.allocBranch(this.non, this.nop);
  }

  override stamp(stamper: Stamper): void {
    const { nin, nip, non, nop, branch1, branch2, gain } = this;
    stamper.stampMatrix(nin, branch1, -1);
    stamper.stampMatrix(nip, branch1, 1);
    stamper.stampMatrix(branch1, non, -1);
    stamper.stampMatrix(branch1, nop, 1);
    stamper.stampMatrix(branch1, branch1, -gain);
    stamper.stampMatrix(non, branch2, -1);
    stamper.stampMatrix(nop, branch2, 1);
    stamper.stampMatrix(branch2, nin, 1);
    stamper.stampMatrix(branch2, nip, -1);
  }

  override details(): Details {
    const { branch2, non, nop } = this;
    const voltage = nop.voltage - non.voltage;
    const current = -branch2.current;
    const power = -(voltage * current);
    return [
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
