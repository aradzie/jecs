import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import { CircuitError } from "../simulation/error";
import type { Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../util/unit";

export interface ResistorProps extends DeviceProps {
  readonly r: number;
}

/**
 * Resistor.
 */
export class Resistor extends Device {
  static override readonly id = "r";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [{ name: "r", unit: Unit.OHM }];

  /** First terminal. */
  readonly na: Node;
  /** Second terminal. */
  readonly nb: Node;
  /** Resistance. */
  readonly r: number;

  constructor(
    name: string, //
    [na, nb]: readonly Node[],
    { r }: ResistorProps,
  ) {
    super(name, [na, nb]);
    this.na = na;
    this.nb = nb;
    this.r = r;
    if (this.r === 0) {
      throw new CircuitError();
    }
  }

  override stamp(stamper: Stamper): void {
    const { na, nb, r } = this;
    const g = 1.0 / r;
    stamper.stampMatrix(na, na, g);
    stamper.stampMatrix(na, nb, -g);
    stamper.stampMatrix(nb, na, -g);
    stamper.stampMatrix(nb, nb, g);
  }

  override details(): Details {
    const { na, nb, r } = this;
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
