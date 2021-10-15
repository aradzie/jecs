import type { Op } from "../circuit/ops";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import { Props } from "../circuit/props";
import { Unit } from "../util/unit";

export interface ResistorProps {
  readonly r: number;
}

/**
 * Resistor.
 */
export class Resistor extends Device<ResistorProps> {
  static override readonly id = "R";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    r: Props.number({
      title: "resistance",
    }),
  };

  /** First terminal. */
  readonly na: Node;
  /** Second terminal. */
  readonly nb: Node;

  constructor(name: string, [na, nb]: readonly Node[], props: ResistorProps) {
    super(name, [na, nb], props);
    this.na = na;
    this.nb = nb;
  }

  override stamp(stamper: Stamper): void {
    const { props, na, nb } = this;
    const { r } = props;
    stamper.stampConductance(na, nb, 1.0 / r);
  }

  override ops(): readonly Op[] {
    const { props, na, nb } = this;
    const { r } = props;
    const voltage = na.voltage - nb.voltage;
    const current = voltage / r;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
