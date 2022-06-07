import { Device, DeviceState, EvalOptions } from "../../circuit/device.js";
import type { Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";
import { pnConductance, pnCurrent, pnVcrit, pnVoltage, pnVt } from "./semi.js";

const enum S {
  Is,
  N,
  Vt,
  Vcrit,
  V,
  I,
  G,
  P,
  _Size_,
}

/**
 * Diode.
 */
export class Diode extends Device {
  static override readonly id = "Diode";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    Is: Properties.number({
      default: 1e-14,
      min: 0,
      title: "saturation current",
    }),
    N: Properties.number({
      default: 1,
      min: 1e-3,
      max: 100,
      title: "emission coefficient",
    }),
    Temp: Properties.Temp,
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** The anode terminal. */
  readonly na: Node;
  /** The cathode terminal. */
  readonly nc: Node;

  constructor(id: string, [na, nc]: readonly Node[]) {
    super(id, [na, nc]);
    this.na = na;
    this.nc = nc;
  }

  override deriveState(state: DeviceState): void {
    const Is = this.properties.getNumber("Is");
    const N = this.properties.getNumber("N");
    const Temp = this.properties.getNumber("Temp");
    const Vt = N * pnVt(Temp);
    const Vcrit = pnVcrit(Is, Vt);
    state[S.Is] = Is;
    state[S.Vt] = Vt;
    state[S.Vcrit] = Vcrit;
  }

  private eval0(state: DeviceState, damped: boolean): void {
    const { na, nc } = this;
    const Is = state[S.Is];
    const Vt = state[S.Vt];
    const Vcrit = state[S.Vcrit];
    let V = na.voltage - nc.voltage;
    if (damped) {
      V = pnVoltage(V, state[S.V], Vt, Vcrit);
    }
    const I = pnCurrent(V, Is, Vt);
    const G = pnConductance(V, Is, Vt);
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.G] = G;
    state[S.P] = P;
  }

  override eval(state: DeviceState, options: EvalOptions): void {
    this.eval0(state, true);
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { na, nc } = this;
    const V = state[S.V];
    const I = state[S.I];
    const G = state[S.G];
    stamper.stampConductance(na, nc, G);
    stamper.stampCurrentSource(na, nc, I - G * V);
  }

  override endEval(state: DeviceState, options: EvalOptions): void {
    this.eval0(state, false);
  }
}
