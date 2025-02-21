import {
  celsiusToKelvin,
  type DcParams,
  Device,
  type DeviceState,
  type Network,
  type Node,
  Props,
  type RealStamper,
} from "@jecs/simulator";
import { Eg, gMin, k, q, Tnom, Xti } from "../const.js";
import { coalesce, pnConductance, pnCurrent, pnVoltage } from "./semi.js";

const enum S {
  Is,
  N,
  temp,
  V,
  I,
  G,
  _Size_,
}

/**
 * Diode.
 */
export class Diode extends Device.Dc {
  static override readonly id = "Diode";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    Is: Props.number({
      defaultValue: 1e-14,
      range: ["real", ">", 0],
      title: "saturation current",
    }),
    N: Props.number({
      defaultValue: 1,
      range: ["real", ">", 0],
      title: "emission coefficient",
    }),
    temp: Props.temp,
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
    ],
  };
  static override readonly linear = false;

  /** The anode terminal. */
  private na!: Node;
  /** The cathode terminal. */
  private nc!: Node;

  override connect(network: Network, [na, nc]: readonly Node[]): void {
    this.na = na;
    this.nc = nc;
  }

  override reset(props: Props, state: DeviceState): void {
    const Is = props.getNumber("Is");
    const N = props.getNumber("N");
    const temp = props.getNumber("temp", NaN);

    state[S.Is] = Is;
    state[S.N] = N;
    state[S.temp] = temp;
  }

  override loadDc(state: DeviceState, { temp }: DcParams, stamper: RealStamper): void {
    this.#eval(state, temp, true);

    const { na, nc } = this;

    const V = state[S.V];
    const I = state[S.I];
    const G = state[S.G];

    stamper.stampConductance(na, nc, G);
    stamper.stampCurrentSource(na, nc, I - G * V);
  }

  override endDc(state: DeviceState, { temp }: DcParams): void {
    this.#eval(state, temp, false);
  }

  #eval(state: DeviceState, globalTemp: number, damped: boolean): void {
    const { na, nc } = this;

    const Is = state[S.Is];
    const N = state[S.N];
    const temp = celsiusToKelvin(coalesce(state[S.temp], globalTemp));

    const t = temp / Tnom;
    const Vt = N * temp * (k / q);
    const Ist = Is * Math.pow(t, Xti / N) * Math.exp((t - 1) * (Eg / Vt));

    let V = na.voltage - nc.voltage;
    if (damped) {
      const Vcrit = Vt * Math.log(Vt / Math.sqrt(2) / Ist);
      V = pnVoltage(V, state[S.V], Vt, Vcrit);
    }
    const I = pnCurrent(V, Ist, Vt);
    const G = pnConductance(V, Ist, Vt) + gMin;

    state[S.V] = V;
    state[S.I] = I;
    state[S.G] = G;
  }
}
