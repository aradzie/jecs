import type { Node, Stamper } from "../network";
import { Device, DeviceProps, Unit } from "./device";

export interface VCISourceProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Voltage-controlled current source.
 */
export class VCISource extends Device {
  static override readonly id = "vcis";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = [
    { name: "gain", unit: Unit.UNITLESS },
  ];

  /** Negative input terminal. */
  readonly ia: Node;
  /** Negative output terminal. */
  readonly ib: Node;
  /** Positive input terminal. */
  readonly oa: Node;
  /** Positive output terminal. */
  readonly ob: Node;
  /** Gain. */
  readonly gain: number;

  constructor(
    [ia, ib, oa, ob]: readonly Node[],
    { name, gain }: VCISourceProps,
  ) {
    super([ia, ib, oa, ob], name);
    this.ia = ia;
    this.ib = ib;
    this.oa = oa;
    this.ob = ob;
    this.gain = gain;
  }

  override stamp(stamper: Stamper): void {
    stamper.stampMatrix(this.oa, this.ib, this.gain);
    stamper.stampMatrix(this.oa, this.ia, -this.gain);
    stamper.stampMatrix(this.ob, this.ib, -this.gain);
    stamper.stampMatrix(this.ob, this.ia, this.gain);
  }
}
