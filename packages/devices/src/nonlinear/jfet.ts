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
  coalesce,
  type FetPolarity,
  fetSign,
  nfet,
  pfet,
  pnConductance,
  pnCurrent,
  pnVoltage,
} from "./semi.js";

const enum S {
  /** Device polarity, +1 for nfet, -1 for pfet. */
  pol,
  /** Threshold voltage. */
  Vth,
  /** Transconductance parameter. */
  beta,
  /** Channel-length modulation parameter. */
  lambda,
  /** Saturation current. */
  Is,
  /** Emission coefficient. */
  N,
  /** Device temperature. */
  temp,
  /** Gate-source diode voltage. */
  Vgs,
  /** Gate-source diode current. */
  Igs,
  /** Gate-source diode conductance. */
  Ggs,
  /** Gate-drain diode voltage. */
  Vgd,
  /** Gate-drain diode current. */
  Igd,
  /** Gate-drain diode conductance. */
  Ggd,
  /** Jfet drain-source voltage. */
  Vds,
  /** Jfet drain-source current. */
  Ids,
  /** Jfet drain-source conductance. */
  Gds,
  /** Jfet transconductance. */
  Gm,
  _Size_,
}

/**
 * Junction field-effect transistor, JFET.
 */
export class Jfet extends Device.Dc {
  static override readonly id = "JFET";
  static override readonly numTerminals = 3;
  static override readonly propsSchema = {
    polarity: Props.string({
      range: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Props.number({
      defaultValue: -2.0,
      range: ["real"],
      title: "threshold voltage",
    }),
    beta: Props.number({
      defaultValue: 1e-4,
      range: ["real", ">", 0],
      title: "transconductance parameter",
    }),
    lambda: Props.number({
      defaultValue: 0.0,
      range: ["real", ">=", 0],
      title: "channel-length modulation parameter",
    }),
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
      { index: S.Vgs, name: "Vgs", unit: "V" },
      { index: S.Vgd, name: "Vgd", unit: "V" },
      { index: S.Vds, name: "Vds", unit: "V" },
      { index: S.Ids, name: "Ids", unit: "A" },
      // { index: S.Gm, name: "gm", unit: "A/V" },
    ],
  };
  static override readonly linear = false;

  /** The source terminal. */
  private ns!: Node;
  /** The gate terminal. */
  private ng!: Node;
  /** The drain terminal. */
  private nd!: Node;

  override connect(network: Network, [ns, ng, nd]: readonly Node[]): void {
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
  }

  override reset(props: Props, state: DeviceState): void {
    const polarity = props.getString("polarity") as FetPolarity;
    const Vth = props.getNumber("Vth");
    const beta = props.getNumber("beta");
    const lambda = props.getNumber("lambda");
    const Is = props.getNumber("Is");
    const N = props.getNumber("N");
    const temp = props.getNumber("temp", NaN);

    state[S.pol] = fetSign(polarity);
    state[S.Vth] = Vth;
    state[S.beta] = beta;
    state[S.lambda] = lambda;
    state[S.Is] = Is;
    state[S.N] = N;
    state[S.temp] = temp;
  }

  override loadDc(state: DeviceState, { temp }: DcParams, stamper: RealStamper): void {
    this.#eval(state, temp, true);

    const { ns, ng, nd } = this;

    const pol = state[S.pol];
    const Vgs = pol * state[S.Vgs];
    const Igs = pol * state[S.Igs];
    const Ggs = state[S.Ggs];
    const Vgd = pol * state[S.Vgd];
    const Igd = pol * state[S.Igd];
    const Ggd = state[S.Gds];
    const Vds = pol * state[S.Vds];
    const Ids = pol * state[S.Ids];
    const Gds = state[S.Gds];
    const Gm = state[S.Gm];

    // DIODES

    stamper.stampConductance(ng, ns, Ggs);
    stamper.stampCurrentSource(ng, ns, pol * (Igs - Ggs * Vgs));

    stamper.stampConductance(ng, nd, Ggd);
    stamper.stampCurrentSource(ng, nd, pol * (Igd - Ggd * Vgd));

    // FET

    stamper.stampConductance(nd, ns, Gds);
    stamper.stampTransconductance(nd, ns, ng, ns, Gm);
    stamper.stampCurrentSource(nd, ns, pol * (Ids - Gds * Vds - Gm * Vgs));
  }

  override saveDc(state: DeviceState, { temp }: DcParams): void {
    this.#eval(state, temp, false);
  }

  #eval(state: DeviceState, globalTemp: number, damped: boolean): void {
    const { ns, ng, nd } = this;

    const pol = state[S.pol];
    const Vth = state[S.Vth];
    const beta = state[S.beta];
    const lambda = state[S.lambda];
    const Is = state[S.Is];
    const N = state[S.N];
    const temp = celsiusToKelvin(coalesce(state[S.temp], globalTemp));

    const t = temp / Tnom;
    const Vt = N * temp * (k / q);

    // VOLTAGES

    let Vgs = pol * (ng.voltage - ns.voltage);
    let Vgd = pol * (ng.voltage - nd.voltage);
    if (damped) {
      const Ist = Is * Math.pow(t, Xti / N) * Math.exp((t - 1) * (Eg / Vt));
      const Vcrit = Vt * Math.log(Vt / Math.sqrt(2) / Ist);
      Vgs = pnVoltage(Vgs, pol * state[S.Vgs], Vt, Vcrit);
      Vgd = pnVoltage(Vgd, pol * state[S.Vgd], Vt, Vcrit);
    }
    const Vds = Vgs - Vgd;

    // DIODES

    const Igs = pnCurrent(Vgs, Is, Vt);
    const Ggs = pnConductance(Vgs, Is, Vt) + gMin;
    const Igd = pnCurrent(Vgd, Is, Vt);
    const Ggd = pnConductance(Vgd, Is, Vt) + gMin;

    // FET

    let Ids;
    let Gds;
    let Gm;
    if (Vgs >= Vgd) {
      // Normal mode.
      const Vgst = Vgs - Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        Ids = 0;
        Gds = gMin;
        Gm = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          Ids = c1 * Vgst * Vgst;
          Gds = beta * lambda * Vgst * Vgst;
          Gm = 2 * c1 * Vgst;
        } else {
          // Linear region.
          Ids = c1 * Vds * (2 * Vgst - Vds);
          Gds = 2 * c1 * (Vgst - Vds) + beta * c0 * (2 * Vgst - Vds);
          Gm = 2 * c1 * Vds;
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        Ids = 0;
        Gds = gMin;
        Gm = 0;
      } else {
        const Vsd = -Vds;
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          Ids = -c1 * Vgdt * Vgdt;
          Gds = beta * lambda * Vgdt * Vgdt + 2 * c1 * Vgdt;
          Gm = -2 * c1 * Vgdt;
        } else {
          // Linear region.
          Ids = -c1 * Vsd * (2 * Vgdt - Vsd);
          Gds = 2 * c1 * Vgdt + beta * c0 * (2 * Vgdt - Vsd);
          Gm = -2 * c1 * Vsd;
        }
      }
    }

    // VOLTAGES

    state[S.Vgs] = pol * Vgs;
    state[S.Vgd] = pol * Vgd;
    state[S.Vds] = pol * Vds;

    // DIODES

    state[S.Igs] = pol * Igs;
    state[S.Ggs] = Ggs;
    state[S.Igd] = pol * Igd;
    state[S.Ggd] = Ggd;

    // FET

    state[S.Ids] = pol * Ids;
    state[S.Gds] = Gds;
    state[S.Gm] = Gm;
  }
}
