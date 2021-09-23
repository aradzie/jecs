import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../simulation/props";

export interface CCCSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Current-controlled current source.
 */
export class CCCSource extends Device {
  static override readonly id = "cccs";
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
  branch!: Branch;

  constructor(
    name: string,
    [nin, nip, non, nop]: readonly Node[],
    { gain }: CCCSourceProps,
  ) {
    super(name, [nin, nip, non, nop]);
    this.nin = nin;
    this.nip = nip;
    this.non = non;
    this.nop = nop;
    this.gain = gain;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.nin, this.nip);
  }

  override stamp(stamper: Stamper): void {
    const { nin, nip, non, nop, branch, gain } = this;
    stamper.stampMatrix(nin, branch, 1 / gain);
    stamper.stampMatrix(nip, branch, -1 / gain);
    stamper.stampMatrix(non, branch, -1);
    stamper.stampMatrix(nop, branch, 1);
    stamper.stampMatrix(branch, nin, -1);
    stamper.stampMatrix(branch, nip, 1);
  }

  override details(): Details {
    const { non, nop, branch } = this;
    const voltage = nop.voltage - non.voltage;
    const current = branch.current;
    return [
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "Vd", value: voltage, unit: Unit.VOLT },
    ];
  }
}
