import type { Node, Stamper } from "../network";
import { Device, DeviceProps, Unit } from "./device";

export interface ICISourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Current-controlled current source.
 */
export class ICISource extends Device {
  static override readonly id = "icis";
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

  constructor(
    name: string,
    [ia, ib, oa, ob]: readonly Node[],
    { gain }: ICISourceProps,
  ) {
    super(name, [ia, ib, oa, ob]);
    this.ia = ia;
    this.ib = ib;
    this.oa = oa;
    this.ob = ob;
    this.gain = gain;
  }

  override stamp(stamper: Stamper): void {}
}
