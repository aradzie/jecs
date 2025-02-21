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
import {
  type BjtPolarity,
  bjtSign,
  coalesce,
  npn,
  pnConductance,
  pnCurrent,
  pnp,
  pnVoltage,
} from "./semi.js";

const enum S {
  /** Device polarity, +1 for npn, -1 for pnp. */
  pol,
  /** Forward alpha. */
  Af,
  /** Reverse alpha. */
  Ar,
  /** Saturation current. */
  Is,
  /** Forward emission coefficient. */
  Nf,
  /** Reverse emission coefficient. */
  Nr,
  /** Device temperature. */
  temp,
  /** Base-emitter voltage. */
  Vbe,
  /** Base-collector voltage. */
  Vbc,
  /** Collector-emitter voltage. */
  Vce,
  /** Emitter current. */
  Ie,
  /** Collector current. */
  Ic,
  /** Base current. */
  Ib,
  /** Forward transconductance. */
  Gf,
  /** Reverse transconductance. */
  Gr,
  _Size_,
}

/**
 * Bipolar junction transistor, BJT.
 */
export class Bjt extends Device.Dc {
  static override readonly id = "BJT";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = {
    polarity: Props.string({
      range: [npn, pnp],
      title: "transistor polarity",
    }),
    Bf: Props.number({
      defaultValue: 100.0,
      range: ["real", ">", 0],
      title: "forward beta",
    }),
    Br: Props.number({
      defaultValue: 1.0,
      range: ["real", ">", 0],
      title: "reverse beta",
    }),
    Is: Props.number({
      defaultValue: 1e-14,
      range: ["real", ">", 0],
      title: "saturation current",
    }),
    Nf: Props.number({
      defaultValue: 1,
      range: ["real", ">", 0],
      title: "forward emission coefficient",
    }),
    Nr: Props.number({
      defaultValue: 1,
      range: ["real", ">", 0],
      title: "reverse emission coefficient",
    }),
    Vaf: Props.number({
      defaultValue: 10.0,
      range: ["real", ">=", 0],
      title: "forward Early voltage",
    }),
    Var: Props.number({
      defaultValue: 0.0,
      range: ["real", ">=", 0],
      title: "reverse Early voltage",
    }),
    temp: Props.temp,
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.Vbe, name: "Vbe", unit: "V" },
      { index: S.Vbc, name: "Vbc", unit: "V" },
      { index: S.Vce, name: "Vce", unit: "V" },
      { index: S.Ie, name: "Ie", unit: "A" },
      { index: S.Ic, name: "Ic", unit: "A" },
      { index: S.Ib, name: "Ib", unit: "A" },
    ],
  };
  static override readonly linear = false;

  /** The emitter terminal. */
  private ne!: Node;
  /** The base terminal. */
  private nb!: Node;
  /** The collector terminal. */
  private nc!: Node;

  override connect(network: Network, [ne, nb, nc]: readonly Node[]): void {
    this.ne = ne;
    this.nb = nb;
    this.nc = nc;
  }

  override reset(props: Props, state: DeviceState): void {
    const polarity = props.getString("polarity") as BjtPolarity;
    const Bf = props.getNumber("Bf");
    const Br = props.getNumber("Br");
    const Is = props.getNumber("Is");
    const Nf = props.getNumber("Nf");
    const Nr = props.getNumber("Nr");
    const temp = props.getNumber("temp", NaN);

    state[S.pol] = bjtSign(polarity);
    state[S.Af] = Bf / (Bf + 1);
    state[S.Ar] = Br / (Br + 1);
    state[S.Is] = Is;
    state[S.Nf] = Nf;
    state[S.Nr] = Nr;
    state[S.temp] = temp;
  }

  override loadDc(state: DeviceState, { temp }: DcParams, stamper: RealStamper): void {
    this.#eval(state, temp, true);

    const { ne, nb, nc } = this;

    const pol = state[S.pol];
    const Af = state[S.Af];
    const Ar = state[S.Ar];
    const Vbe = pol * state[S.Vbe];
    const Vbc = pol * state[S.Vbc];
    const Ie = pol * state[S.Ie];
    const Ic = pol * state[S.Ic];
    const Gf = state[S.Gf];
    const Gr = state[S.Gr];
    const Gee = -Gf;
    const Gcc = -Gr;
    const Gec = Ar * Gr;
    const Gce = Af * Gf;

    stamper.stampConductance(ne, nb, -Gee);
    stamper.stampConductance(nc, nb, -Gcc);
    stamper.stampTransconductance(ne, nb, nc, nb, -Gec);
    stamper.stampTransconductance(nc, nb, ne, nb, -Gce);
    stamper.stampCurrentSource(ne, nb, pol * (Ie - Gee * Vbe - Gec * Vbc));
    stamper.stampCurrentSource(nc, nb, pol * (Ic - Gce * Vbe - Gcc * Vbc));
  }

  override saveDc(state: DeviceState, { temp }: DcParams): void {
    this.#eval(state, temp, false);
  }

  #eval(state: DeviceState, globalTemp: number, damped: boolean): void {
    const { ne, nb, nc } = this;

    const Is = state[S.Is];
    const Nf = state[S.Nf];
    const Nr = state[S.Nr];
    const temp = celsiusToKelvin(coalesce(state[S.temp], globalTemp));

    const t = temp / Tnom;
    const Vtf = Nf * temp * (k / q);
    const Vtr = Nr * temp * (k / q);
    const Istf = Is * Math.pow(t, Xti / Nf) * Math.exp((t - 1) * (Eg / Vtf));
    const Istr = Is * Math.pow(t, Xti / Nr) * Math.exp((t - 1) * (Eg / Vtr));

    const pol = state[S.pol];
    const Af = state[S.Af];
    const Ar = state[S.Ar];

    let Vbe = pol * (nb.voltage - ne.voltage);
    let Vbc = pol * (nb.voltage - nc.voltage);
    if (damped) {
      const Vcritf = Vtf * Math.log(Vtf / Math.sqrt(2) / Istf);
      Vbe = pnVoltage(Vbe, pol * state[S.Vbe], Vtf, Vcritf);
      const Vcritr = Vtr * Math.log(Vtr / Math.sqrt(2) / Istr);
      Vbc = pnVoltage(Vbc, pol * state[S.Vbc], Vtr, Vcritr);
    }
    const If = pnCurrent(Vbe, Istf, Vtf);
    const Ir = pnCurrent(Vbc, Istr, Vtr);
    const Ie = Ar * Ir - If;
    const Ic = Af * If - Ir;
    const Gf = pnConductance(Vbe, Istf, Vtf) + gMin;
    const Gr = pnConductance(Vbc, Istr, Vtr) + gMin;

    state[S.Vbe] = pol * Vbe;
    state[S.Vbc] = pol * Vbc;
    state[S.Vce] = pol * (Vbe - Vbc);
    state[S.Ie] = pol * Ie;
    state[S.Ic] = pol * Ic;
    state[S.Ib] = pol * -(Ie + Ic);
    state[S.Gf] = Gf;
    state[S.Gr] = Gr;
  }
}
