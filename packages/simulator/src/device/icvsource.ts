import { Device } from "../simulation/device";
import type { Branch, Network, Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../simulation/props";

export interface ICVSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Current-controlled voltage source.
 */
export class ICVSource extends Device {
  static override readonly id = "icvs";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = [
    { name: "gain", unit: Unit.UNITLESS },
  ];

  /** Negative input terminal. */
  readonly ia: Node;
  /** Positive input terminal. */
  readonly ib: Node;
  /** Negative output terminal. */
  readonly oa: Node;
  /** Positive output terminal. */
  readonly ob: Node;
  /** Gain. */
  readonly gain: number;
  /** Extra MNA branch. */
  branch!: Branch;

  constructor(
    name: string,
    [ia, ib, oa, ob]: readonly Node[],
    { gain }: ICVSourceProps,
  ) {
    super(name, [ia, ib, oa, ob]);
    this.ia = ia;
    this.ib = ib;
    this.oa = oa;
    this.ob = ob;
    this.gain = gain;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.oa, this.ob);
  }

  override stamp(stamper: Stamper): void {}
}
