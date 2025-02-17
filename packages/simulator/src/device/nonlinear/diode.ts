import { type DcParams, Device, type DeviceState } from "../../circuit/device.js";
import { type RealStamper } from "../../circuit/mna.js";
import { type Network, type Node } from "../../circuit/network.js";
import { Props } from "../../circuit/props.js";
import { celsiusToKelvin } from "../../util/unit.js";
import { gMin } from "../const.js";
import { pnConductance, pnCurrent, pnTemp, pnVoltage } from "./semi.js";

const enum S {
  Is,
  N,
  Vt,
  Vcrit,
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

  override initDc(state: DeviceState, params: DcParams): void {
    const Is = this.props.getNumber("Is");
    const N = this.props.getNumber("N");
    const temp = celsiusToKelvin(this.props.getNumber("temp", params.temp));
    const [Vt, Ist, Vcrit] = pnTemp(temp, Is, N);
    state[S.Is] = Ist;
    state[S.Vt] = Vt;
    state[S.Vcrit] = Vcrit;
  }

  private eval(state: DeviceState, damped: boolean): void {
    const { na, nc } = this;
    const Is = state[S.Is];
    const Vt = state[S.Vt];
    const Vcrit = state[S.Vcrit];
    let V = na.voltage - nc.voltage;
    if (damped) {
      V = pnVoltage(V, state[S.V], Vt, Vcrit);
    }
    const I = pnCurrent(V, Is, Vt);
    const G = pnConductance(V, Is, Vt) + gMin;
    state[S.V] = V;
    state[S.I] = I;
    state[S.G] = G;
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { na, nc } = this;
    this.eval(state, true);
    const V = state[S.V];
    const I = state[S.I];
    const G = state[S.G];
    stamper.stampConductance(na, nc, G);
    stamper.stampCurrentSource(na, nc, I - G * V);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    this.eval(state, false);
  }
}
