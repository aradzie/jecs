import type { Details } from "../simulation/details";
import { Device } from "../simulation/device";
import type { Node, Stamper } from "../simulation/network";
import type { DeviceProps } from "../simulation/props";
import { Unit } from "../util/unit";
import { default_I_S, default_n, default_T, PN } from "./pn";

export interface DiodeProps extends DeviceProps {
  /** The reverse bias saturation current, `A`. */
  readonly I_S: number;
  /** The temperature, `K`. */
  readonly T: number;
  /** The ideality factor. */
  readonly n: number;
}

/**
 * Diode.
 */
export class Diode extends Device {
  static override readonly id = "d";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [
    { name: "I_S", unit: Unit.AMPERE, default: default_I_S },
    { name: "T", unit: Unit.KELVIN, default: default_T },
    { name: "n", unit: Unit.UNITLESS, default: default_n },
  ];

  /** Anode terminal. */
  readonly na: Node;
  /** Cathode terminal. */
  readonly nc: Node;
  /** Diode state. */
  readonly pn: PN;

  constructor(
    name: string, //
    [na, nc]: readonly Node[],
    {
      I_S = default_I_S,
      T = default_T,
      n = default_n,
    }: Partial<DiodeProps> = {},
  ) {
    super(name, [na, nc]);
    this.na = na;
    this.nc = nc;
    this.pn = new PN(I_S, T, n);
  }

  override stamp(stamper: Stamper): void {
    const { na, nc, pn } = this;
    const voltage = na.voltage - nc.voltage;
    if (voltage >= 0) {
      pn.stamp(stamper, na, nc, voltage);
    }
  }

  override details(): Details {
    const { na, nc, pn } = this;
    const voltage = na.voltage - nc.voltage;
    let current = 0;
    let power = 0;
    if (voltage >= 0) {
      current = pn.I_D(voltage);
      power = voltage * current;
    }
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
