import type { Node, Stamper } from "../network";
import { Device, DeviceProps } from "./device";

export interface ICISourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Current-controlled current source.
 */
export class ICISource extends Device {
  static override readonly id = "icis";
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

  constructor(
    [ia, ib, oa, ob]: readonly Node[],
    { name, gain }: ICISourceProps,
  ) {
    super([ia, ib, oa, ob], name);
    this.ia = ia;
    this.ib = ib;
    this.oa = oa;
    this.ob = ob;
    this.gain = gain;
  }

  override stamp(stamper: Stamper): void {}
}
