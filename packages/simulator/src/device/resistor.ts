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
  readonly a: Node;
  /** Second terminal. */
  readonly b: Node;
  /** Resistance. */
  readonly r: number;

  constructor(
    name: string, //
    [a, b]: readonly Node[],
    { r }: ResistorProps,
  ) {
    super(name, [a, b]);
    this.a = a;
    this.b = b;
    this.r = r;
    if (this.r === 0) {
      throw new CircuitError();
    }
  }

  override stamp(stamper: Stamper): void {
    const g = 1.0 / this.r;
    stamper.stampMatrix(this.a, this.a, g);
    stamper.stampMatrix(this.a, this.b, -g);
    stamper.stampMatrix(this.b, this.a, -g);
    stamper.stampMatrix(this.b, this.b, g);
  }

  override details(): Details {
    const { a, b, r } = this;
    const voltage = a.voltage - b.voltage;
    const current = voltage / r;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
