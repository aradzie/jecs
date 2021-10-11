import type { Details } from "../circuit/details";
import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import type { DeviceProps } from "../circuit/props";
import { Unit } from "../util/unit";
import { PN } from "./semi";

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
  /** The PN junction of diode. */
  readonly pn: PN;

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
    this.pn = new PN(this.T, this.Is, this.N);
  }

  override getInitialState(): DiodeState {
    return { prevVoltage: 0 };
  }

  override stamp(stamper: Stamper, state: DiodeState): void {
    const { na, nc, pn } = this;
    const voltage = (state.prevVoltage = pn.limitVoltage(
      na.voltage - nc.voltage,
      state.prevVoltage,
    ));
    const Id = pn.evalCurrent(voltage);
    const eqGd = pn.evalConductance(voltage);
    const eqId = Id - eqGd * voltage;
    stamper.stampConductance(na, nc, eqGd);
    stamper.stampCurrentSource(na, nc, eqId);
  }

  override details(): Details {
    const { na, nc, pn } = this;
    const voltage = na.voltage - nc.voltage;
    const current = pn.evalCurrent(voltage);
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
