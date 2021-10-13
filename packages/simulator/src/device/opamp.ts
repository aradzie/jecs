import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import { Props } from "../circuit/props";
import { Unit } from "../util/unit";

export interface OpAmpProps {
  readonly gain: number;
}

/**
 * Ideal operational amplifier.
 */
export class OpAmp extends Device<OpAmpProps> {
  static override readonly id = "OpAmp";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = {
    gain: Props.number({ title: "gain" }),
  };

  readonly a: Node;
  readonly b: Node;
  readonly o: Node;

  constructor(name: string, [a, b, o]: readonly Node[], props: OpAmpProps) {
    super(name, [a, b, o], props);
    this.a = a;
    this.b = b;
    this.o = o;
  }

  override stamp(stamper: Stamper): void {}
}
