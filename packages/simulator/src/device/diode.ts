import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";
import { k, q } from "./const";

export interface DiodeProps extends DeviceProps {
  /** The temperature, `K`. */
  readonly T: number;
  /** The reverse bias saturation current, `A`. */
  readonly Is: number;
  /** The emission coefficient. */
  readonly N: number;
}

interface DiodeState {
  prevVoltage: number;
}

/**
 * Diode.
 */
export class Diode extends Device<DiodeState> {
  static override readonly id = "Diode";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = [
    { name: "T", unit: Unit.KELVIN, default: 3.0015e2 },
    { name: "Is", unit: Unit.AMPERE, default: 1e-14 },
    { name: "N", unit: Unit.UNITLESS, default: 1 },
  ];

  /** Anode terminal. */
  readonly na: Node;
  /** Cathode terminal. */
  readonly nc: Node;
  /** The temperature. */
  readonly T: number;
  /** The reverse bias saturation current. */
  readonly Is: number;
  /** The emission coefficient. */
  readonly N: number;

  private readonly Vt: number;
  private readonly invVt: number;
  private readonly Vcrit: number;

  constructor(
    name: string, //
    [na, nc]: readonly Node[],
    { T, Is, N }: DiodeProps,
  ) {
    super(name, [na, nc]);
    this.na = na;
    this.nc = nc;
    this.T = T;
    this.Is = Is;
    this.N = N;
    this.Vt = this.N * this.T * (k / q);
    this.invVt = 1 / this.Vt;
    this.Vcrit = this.Vt * Math.log(this.Vt / Math.sqrt(2) / this.Is);
  }

  override getInitialState(): DiodeState {
    return { prevVoltage: 0 };
  }

  override stamp(stamper: Stamper, state: DiodeState): void {
    const { na, nc } = this;
    const voltage = this.limitVoltage(na.voltage - nc.voltage, state);
    const Geq = this.pnConductance(voltage);
    const Ieq = this.pnCurrent(voltage) - Geq * voltage;
    stamper.stampConductance(na, nc, Geq);
    stamper.stampCurrentSource(na, nc, Ieq);
  }

  override details(): Details {
    const { na, nc } = this;
    const voltage = na.voltage - nc.voltage;
    const current = this.pnCurrent(voltage);
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }

  private pnCurrent(V: number): number {
    if (V >= 0) {
      const { Is, invVt } = this;
      return Is * (Math.exp(invVt * V) - 1);
    } else {
      return 0;
    }
  }

  private pnConductance(V: number): number {
    if (V >= 0) {
      const { Is, invVt } = this;
      return invVt * Is * Math.exp(invVt * V);
    } else {
      return 0;
    }
  }

  private limitVoltage(voltage: number, state: DiodeState): number {
    if (voltage >= 0) {
      const { Vt, Vcrit } = this;
      const { prevVoltage } = state;
      if (voltage > Vcrit && Math.abs(voltage - prevVoltage) > 2 * Vt) {
        if (prevVoltage > 0) {
          const x = (voltage - prevVoltage) / Vt;
          if (x > 0) {
            voltage = prevVoltage + Vt * (2 + Math.log(x - 2));
          } else {
            voltage = prevVoltage - Vt * (2 + Math.log(2 - x));
          }
        } else {
          voltage = Vcrit;
        }
      }
    }
    return (state.prevVoltage = voltage);
  }
}
