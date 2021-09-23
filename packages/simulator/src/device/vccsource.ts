import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../simulation/props";

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
    { gain }: VCCSourceProps,
  ) {
    super(name, [nin, nip, non, nop]);
    this.nin = nin;
    this.nip = nip;
    this.non = non;
    this.nop = nop;
    this.gain = gain;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.non, this.nop);
  }

  override stamp(stamper: Stamper): void {
    const { nin, nip, non, nop, branch, gain } = this;
    stamper.stampMatrix(non, branch, 1);
    stamper.stampMatrix(nop, branch, -1);
    stamper.stampMatrix(branch, nin, -gain);
    stamper.stampMatrix(branch, nip, gain);
    stamper.stampMatrix(branch, branch, -1);
  }
}