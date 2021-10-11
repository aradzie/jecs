import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import { CircuitError } from "../circuit/error";
import type { Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";

export interface ResistorProps extends DeviceProps {
  readonly r: number;
}

/**
 * Resistor.
 */
export class Resistor extends Device<ResistorProps> {
  static override readonly id = "R";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [{ name: "r", unit: Unit.OHM }];

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

  override details(): Details {
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
