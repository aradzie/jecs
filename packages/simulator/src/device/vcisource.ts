import { Device } from "../simulation/device";
import type { Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../simulation/props";

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
    name: string,
    [ia, ib, oa, ob]: readonly Node[],
    { gain }: VCISourceProps,
  ) {
    super(name, [ia, ib, oa, ob]);
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
