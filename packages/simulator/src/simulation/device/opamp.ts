import type { Node, Stamper } from "../network";
import { Device, DeviceProps, Unit } from "./device";

export interface OpAmpProps extends DeviceProps {
  readonly gain: number;
}

/**
 * Ideal operational amplifier.
 */
export class OpAmp extends Device {
  static override readonly id = "oa";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = [
    { name: "gain", unit: Unit.UNITLESS },
  ];

  readonly a: Node;
  readonly b: Node;
  readonly o: Node;
  readonly gain: number;

  constructor(
    name: string, //
    [a, b, o]: readonly Node[],
    { gain }: OpAmpProps,
  ) {
    super(name, [a, b, o]);
    this.a = a;
    this.b = b;
    this.o = o;
    this.gain = gain;
  }

  override stamp(stamper: Stamper): void {}
}
