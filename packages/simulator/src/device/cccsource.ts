import { Device } from "../simulation/device";
import type { Node, Stamper } from "../simulation/network";
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
    { gain }: CCCSourceProps,
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
