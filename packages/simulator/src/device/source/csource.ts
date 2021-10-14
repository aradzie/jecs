import type { Details } from "../../circuit/details";
import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import { Props } from "../../circuit/props";
import { Unit } from "../../util/unit";

export interface CSourceProps {
  readonly i: number;
}

/**
 * Current source.
 */
export class CSource extends Device<CSourceProps> {
  static override readonly id = "I";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    i: Props.number({ title: "current" }),
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;

  constructor(name: string, [np, nn]: readonly Node[], props: CSourceProps) {
    super(name, [np, nn], props);
    this.np = np;
    this.nn = nn;
  }

  override stamp(stamper: Stamper): void {
    const { props, np, nn } = this;
    const { i } = props;
    stamper.stampCurrentSource(np, nn, i);
  }

  override details(): Details {
    const { props, np, nn } = this;
    const { i } = props;
    const voltage = np.voltage - nn.voltage;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: i, unit: Unit.AMPERE },
    ];
  }
}
