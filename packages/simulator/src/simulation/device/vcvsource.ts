import type { Branch, Network, Node, Stamper } from "../network";
import { Device, DeviceProps } from "./device";

export interface VCVSourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Voltage-controlled voltage source.
 */
export class VCVSource extends Device {
  static override readonly id = "vcvs";
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
    { name, gain }: VCVSourceProps,
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

  override stamp(stamper: Stamper): void {
    stamper.stampMatrix(this.oa, this.branch, -1);
    stamper.stampMatrix(this.ob, this.branch, 1);
    stamper.stampMatrix(this.branch, this.oa, -1);
    stamper.stampMatrix(this.branch, this.ob, 1);
    stamper.stampMatrix(this.branch, this.ia, this.gain);
    stamper.stampMatrix(this.branch, this.ib, -this.gain);
  }
}
