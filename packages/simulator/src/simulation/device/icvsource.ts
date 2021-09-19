import type { Branch, Network, Node, Stamper } from "../network";
import { Device, DeviceProps } from "./device";

export interface ICVSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Current-controlled voltage source.
 */
export class ICVSource extends Device {
  static override readonly id = "icvs";
  static override readonly numTerminals = 4;

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
    [ia, ib, oa, ob]: readonly Node[],
    { name, gain }: ICVSourceProps,
  ) {
    super([ia, ib, oa, ob], name);
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
